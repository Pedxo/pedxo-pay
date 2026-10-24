import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { User } from "src/modules/account/entities/user.entity";
import { Account } from "src/modules/account/entities/account.entity";
import {
  AccountTypes,
  Currency,
} from "src/modules/account/dto/account.dto";
import {
  SexyyoLoginDto,
  SexyyoRegisterDto,
  SexyyoSetPinDto,
} from "../dto/sexyyo-auth.dto";

@Injectable()
export class SexyyoAuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Account) private accountRepo: Repository<Account>,
    private jwtService: JwtService
  ) {}

  async register(dto: SexyyoRegisterDto) {
    const existingUser = await this.userRepo.findOne({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (existingUser) {
      throw new BadRequestException("An account with this email already exists.");
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const hashedPin = dto.transaction_pin
      ? await bcrypt.hash(dto.transaction_pin, 10)
      : null;

    const user = this.userRepo.create({
      email: dto.email.toLowerCase().trim(),
      password: hashedPassword,
      transaction_pin: hashedPin,
      first_name: dto.first_name || dto.email.split("@")[0],
      last_name: dto.last_name || "",
    });

    const savedUser = await this.userRepo.save(user);

    // Automatically provision multi-currency wallets (NGN, USD, GBP, EUR)
    await this.ensureUserWallets(savedUser);

    const userWithAccounts = await this.userRepo.findOne({
      where: { id: savedUser.id },
      relations: ["accounts"],
    });

    const token = await this.generateToken(savedUser);

    return {
      message: "Account created successfully.",
      token,
      user: {
        id: userWithAccounts.id,
        email: userWithAccounts.email,
        first_name: userWithAccounts.first_name,
        last_name: userWithAccounts.last_name,
        has_pin: !!userWithAccounts.transaction_pin,
        created_at: userWithAccounts.created_at,
      },
      accounts: userWithAccounts.accounts,
    };
  }

  async login(dto: SexyyoLoginDto) {
    const user = await this.userRepo.findOne({
      where: { email: dto.email.toLowerCase().trim() },
      relations: ["accounts"],
    });

    if (!user || !user.password) {
      throw new UnauthorizedException("Invalid email or password.");
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid email or password.");
    }

    // Ensure all 4 currency wallets exist
    await this.ensureUserWallets(user);

    const freshUser = await this.userRepo.findOne({
      where: { id: user.id },
      relations: ["accounts"],
    });

    const token = await this.generateToken(freshUser);

    return {
      message: "Logged in successfully.",
      token,
      user: {
        id: freshUser.id,
        email: freshUser.email,
        first_name: freshUser.first_name,
        last_name: freshUser.last_name,
        has_pin: !!freshUser.transaction_pin,
        created_at: freshUser.created_at,
      },
      accounts: freshUser.accounts,
    };
  }

  async getMe(userId: number) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ["accounts"],
    });

    if (!user) throw new UnauthorizedException("User not found.");

    await this.ensureUserWallets(user);

    const refreshed = await this.userRepo.findOne({
      where: { id: userId },
      relations: ["accounts"],
    });

    return {
      user: {
        id: refreshed.id,
        email: refreshed.email,
        first_name: refreshed.first_name,
        last_name: refreshed.last_name,
        has_pin: !!refreshed.transaction_pin,
        created_at: refreshed.created_at,
      },
      accounts: refreshed.accounts,
    };
  }

  async setPin(userId: number, dto: SexyyoSetPinDto) {
    const hashedPin = await bcrypt.hash(dto.pin, 10);
    await this.userRepo.update(userId, { transaction_pin: hashedPin });
    return { success: true, message: "Transaction PIN created successfully." };
  }

  async verifyPin(userId: number, pin: string): Promise<boolean> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user || !user.transaction_pin) return false;
    return await bcrypt.compare(pin, user.transaction_pin);
  }

  private async generateToken(user: User): Promise<string> {
    const payload = { sub: user.id, email: user.email };
    return this.jwtService.signAsync(payload);
  }

  private async ensureUserWallets(user: User): Promise<void> {
    const currencies = [
      Currency.NGN,
      Currency.USD,
      Currency.GBP,
      Currency.EUR,
    ];

    const existingAccounts = await this.accountRepo.find({
      where: { user_id: user.id, type: AccountTypes.SAVING },
    });

    const existingCurrencies = new Set(existingAccounts.map((acc) => acc.currency));

    for (const currency of currencies) {
      if (!existingCurrencies.has(currency)) {
        const nextAccNum = await this.generateNextAccountNumber();
        const accountName = `${user.first_name || "User"} ${user.last_name || ""}`.trim() || user.email;

        const newAccount = this.accountRepo.create({
          user_id: user.id,
          account_name: accountName,
          account_number: nextAccNum,
          currency: currency,
          type: AccountTypes.SAVING,
          balance: 0.0,
        });

        await this.accountRepo.save(newAccount);
      }
    }
  }

  private async generateNextAccountNumber(): Promise<string> {
    const [latestSaving] = await this.accountRepo.find({
      select: { account_number: true },
      where: { type: AccountTypes.SAVING },
      order: { id: "DESC" },
      take: 1,
    });

    const baseStart = 1000000000;
    const latestNum = latestSaving?.account_number
      ? parseInt(latestSaving.account_number, 10)
      : baseStart;

    const nextNum = isNaN(latestNum) ? baseStart + 1 : latestNum + 1;
    return nextNum.toString();
  }
}
