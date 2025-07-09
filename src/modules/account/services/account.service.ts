import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Account } from "../entities/account.entity";
import {
  AccountTypes,
  CreateAccountDto,
  Currency,
  GetAccByAccNumDto,
  GetBalanceResdDto,
} from "../dto/account.dto";
import { TransactionsService } from "../../transactions/transactions.service";
import { CreateTransactionDto } from "../../transactions/dto/create-transaction.dto";
import { User } from "../entities/user.entity";
import { CreateUserDto } from "../dto/create-user.dto";
import { GetUserDto, GetUserByEmailDto } from "../dto/get-all-user.dto";
import { ConfigService } from "@nestjs/config";
import { AppConfig } from "src/config/app.config";

@Injectable()
export class AccountService {
  private readonly config: AppConfig;
  constructor(
    @InjectRepository(Account) private accountRepo: Repository<Account>,
    private transactionService: TransactionsService,
    @InjectRepository(User) private userRepo: Repository<User>,
    private configService: ConfigService
  ) {
    this.config = this.configService.get("app");
  }

  async getBalance(
    getAccByAccNumDto: GetAccByAccNumDto
  ): Promise<GetBalanceResdDto> {
    const account = await this.accountRepo.findOne({
      where: { account_number: getAccByAccNumDto.account_number },
    });
    if (!account) throw new NotFoundException("Account balance not found.");
    return {
      account_number: account.account_number,
      balance: account?.balance.toString(),
    };
  }

  async getUser(getOneUserDto: GetUserByEmailDto): Promise<User> {
    let user = await this.userRepo.findOne({
      where: { email: getOneUserDto.email },
    });
    if (!user) throw new NotFoundException("Invalid user.");
    return user;
  }

  async getAllUser(limit: number, offset: number): Promise<GetUserDto> {
    let take = limit || 10;
    let skip = offset || 0;
    let [items, total] = await this.userRepo.findAndCount({
      order: { id: "DESC" },
      take: take,
      skip: skip,
    });
    return { items, total };
  }

  async newAccNum(type: string = AccountTypes.SAVING): Promise<number> {
    let [Account] = await this.accountRepo.find({
      select: {
        account_number: true,
      },
      where: { type },
      order: { id: "DESC" },
      take: 1,
    });

    let accountNumberStart =
      type == AccountTypes.POOL
        ? this.config.accNumPoolStart
        : this.config.accNumSavingStart;
    let accountNumber = parseInt(Account?.account_number ?? accountNumberStart);
    return (accountNumber += 1);
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const account_name = this.getAccountName(createUserDto);
    let user = await this.userRepo.findOne({
      where: { email: createUserDto.email },
    });
    if (user) return user;
    user = await this.userRepo.save(createUserDto);
    await this.createAccount({
      account_name,
      user_id: user.id,
      type: AccountTypes.SAVING,
      currency: createUserDto.currency,
    });
    return await this.userRepo.findOne({
      where: { email: createUserDto.email },
    });
  }

  async createAccount(createAccountDto: CreateAccountDto): Promise<Account> {
    const acc_num = (await this.newAccNum(createAccountDto.type)).toString();
    createAccountDto.account_name =
      createAccountDto.type == AccountTypes.SAVING
        ? createAccountDto.account_name
        : `${createAccountDto.account_name} ${createAccountDto.currency}`;

    const exist =
      createAccountDto.type == AccountTypes.SAVING
        ? null
        : await this.accountRepo.findOne({
            where: {
              type: createAccountDto.type,
              currency: createAccountDto.currency,
            },
          });
    if (exist) return exist;
    try {
      return await this.accountRepo.save({
        ...createAccountDto,
        account_number: acc_num,
      });
    } catch (error) {
      const res = error.message.includes("FOREIGN KEY")
        ? "Unknow user_id"
        : error.message;
      throw new BadRequestException(res);
    }
  }

  getAccountName(user: CreateUserDto): string {
    return `${user.first_name} ${user.last_name}`;
  }

  async getPoolAccountNumber(
    currency: string = Currency.NGN
  ): Promise<Account> {
    return await this.accountRepo.findOne({
      where: { currency, type: "pool" },
    });
  }

  getDefaultPoolDetail(currency: string) {
    return {
      email: "pedxopay@pedxopay.com",
      first_name: "pedxopay",
      password: "",
      last_name: currency,
      currency: currency,
    };
  }
}
