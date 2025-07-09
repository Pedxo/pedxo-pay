import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import {
  ReverseTrxDto,
  UpdateTransactionDto,
} from "./dto/update-transaction.dto";
import { Transactions } from "./entities/transaction.entity";
import { And, DataSource, Not, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Account } from "../account/entities/account.entity";
import { PosBalanceRes, PostTrxDTO } from "./dto/post.dto";
import {
  TransactionStatus,
  DbSort,
  TransactionTypes,
} from "./transactionEnum/transaction.enum";
import { NotFoundError } from "rxjs";
import {
  GetAllTransactionDto,
  GetTrxByAccountDto,
} from "./dto/get-transaction-dto";
import { DepositDto } from "./dto/deposit.dto";
import { InitiateTrxResDto, PostToAccResponse } from "./dto/post-response.dto";

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transactions)
    private transactionRepo: Repository<Transactions>,
    private dabaseSource: DataSource
  ) {}

  async initiate(
    createTransactionDto: CreateTransactionDto,
    ref = null
  ): Promise<Transactions> {
    const trxExist =
      createTransactionDto.type !== TransactionTypes.REVERSAL
        ? await this.transactionRepo.findOne({
            where: {
              ini_reference: createTransactionDto.ini_reference,
              type: Not(TransactionTypes.REVERSAL),
            },
          })
        : null;

    if (trxExist) throw new BadRequestException("Duplicate transaction");
    let iniBalanceRes: PostToAccResponse =
      await this.debitInitiator(createTransactionDto);
    let recBalanceRes: PostToAccResponse =
      await this.creditRecipient(createTransactionDto);
    const trxPaylod: PostTrxDTO[] = this.getTransactionHistoryPayload(
      createTransactionDto,
      iniBalanceRes.balanceRes,
      recBalanceRes.balanceRes,
      ref,
      iniBalanceRes.account.currency
    );
    return await this.post(
      trxPaylod,
      iniBalanceRes.account,
      recBalanceRes.account
    );
  }

  async getAllTransaction(qeury: GetAllTransactionDto) {
    let order = qeury?.order ?? DbSort.DESC;
    try {
      let [items, total] = await this.transactionRepo.findAndCount({
        order: { id: order },
        take: qeury?.take ?? 20,
        skip: qeury?.skip ?? 0,
      });
      return { items, total };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getTransactionByAcc(
    accNumm: GetTrxByAccountDto,
    qeury: GetAllTransactionDto
  ) {
    let order = qeury?.order ?? DbSort.DESC;
    try {
      let [items, total] = await this.transactionRepo.findAndCount({
        where: { account_number: accNumm.account_number },
        order: { id: order },
        take: qeury?.take ?? 20,
        skip: qeury?.skip ?? 0,
      });
      return { items, total };
    } catch (error) {}
    return;
  }

  update(id: number, updateTransactionDto: UpdateTransactionDto) {
    return `This action updates a #${id} transaction`;
  }

  async post(
    trxPaylod: PostTrxDTO[],
    iniAccount: Account,
    recAccount: Account
  ): Promise<Transactions> {
    let trxResponse: Transactions[] | Transactions;

    const queryRunner = this.dabaseSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.save(Account, iniAccount);
      await queryRunner.manager.save(Account, recAccount);

      let createInstance = queryRunner.manager.create(Transactions, trxPaylod);
      trxResponse = await queryRunner.manager.save(
        Transactions,
        createInstance
      );
      await queryRunner.commitTransaction();
      return trxResponse[0];
    } catch (e) {
      await queryRunner.rollbackTransaction();
      let newTrxPaylod = trxPaylod[0];
      newTrxPaylod.status = TransactionStatus.FAILED;
      trxResponse = await queryRunner.manager.save(Transactions, newTrxPaylod);
      throw new BadRequestException(e.message);
    } finally {
      await queryRunner.release();
    }
  }
  async debitInitiator(
    createTrxDto: CreateTransactionDto
  ): Promise<PostToAccResponse> {
    let initiatorAcc = await this.dabaseSource.manager.findOne(Account, {
      where: { account_number: createTrxDto.initiator_accountNumber },
    });

    if (!initiatorAcc) throw new BadRequestException("Account not found");
    const opening_balance = parseFloat(initiatorAcc.balance.toString());
    if (opening_balance < createTrxDto.amount && initiatorAcc.type !== "pool")
      throw new BadRequestException("Insufficent balance");
    let closing_balance = opening_balance - Math.abs(createTrxDto.amount);
    initiatorAcc.balance = closing_balance;
    return {
      account: initiatorAcc,
      balanceRes: { opening_balance, closing_balance },
    };
  }

  async creditRecipient(
    createTrxDto: CreateTransactionDto
  ): Promise<PostToAccResponse> {
    let recipientAcc = await this.dabaseSource.manager.findOne(Account, {
      where: { account_number: createTrxDto.recipient_accountNumber },
    });

    if (!recipientAcc) throw new NotFoundError("Account not found");
    let opening_balance = parseFloat(recipientAcc.balance.toString());
    let closing_balance = opening_balance + Math.abs(createTrxDto.amount);
    recipientAcc.balance = closing_balance;
    return {
      account: recipientAcc,
      balanceRes: { opening_balance, closing_balance },
    };
  }

  getTransactionHistoryPayload(
    createTrxDto: CreateTransactionDto,
    iniBalanceRes: PosBalanceRes,
    recBalanceRes: PosBalanceRes,
    ref = null,
    currency = null
  ): PostTrxDTO[] {
    const payment_ref =
      createTrxDto.type !== TransactionTypes.REVERSAL
        ? this.getPaymentRef(createTrxDto.type)
        : ref;
    let description = `From ${createTrxDto.initiator_name} to ${createTrxDto.recipient_name}`;

    let initiatorData = {
      account_number: createTrxDto.initiator_accountNumber,
      ...createTrxDto,
      payment_ref,
      status: TransactionStatus.SUCCESSFUL,
      ...iniBalanceRes,
      description,
      currency,
    };
    initiatorData.amount = -Math.abs(createTrxDto.amount);
    let recipientrData = {
      account_number: createTrxDto.recipient_accountNumber,
      ...createTrxDto,
      payment_ref,
      status: TransactionStatus.SUCCESSFUL,
      ...recBalanceRes,
      description,
      currency,
    };
    recipientrData.amount = Math.abs(createTrxDto.amount);
    return [initiatorData, recipientrData];
  }
  getPaymentRef(type: string) {
    let tiemStapm = Date.now();
    let prifix = type.slice(0, 3);
    const char = "ABCDEFJHIJkl12345KLMNOPQRSTUVWXYZ67890";
    let result = "";
    for (let i = 0; i < 4; i++) {
      const randomIndex = Math.floor(Math.random() * char.length);
      result += char[randomIndex];
    }
    return `${prifix.toUpperCase()}-${tiemStapm}-${result}`;
  }

  async deposit(trxDto: DepositDto): Promise<any> {
    return await this.initiate(await this.getDepositORPayoutPayload(trxDto));
  }

  async getDepositORPayoutPayload(
    trxDto: DepositDto
  ): Promise<CreateTransactionDto> {
    const account = await this.dabaseSource.manager.findOne(Account, {
      where: { account_number: trxDto.account_number },
    });
    if (!account) throw new BadRequestException("Account not found");
    const poolAccount = await this.dabaseSource.manager.findOne(Account, {
      where: { currency: account.currency, type: "pool" },
    });
    if (!poolAccount) throw new BadRequestException("Pool account not found");
    const initiator_name =
      trxDto.type == TransactionTypes.DEPOSIT
        ? poolAccount.account_name
        : account.account_name;
    const initiator_accountNumber =
      trxDto.type == TransactionTypes.DEPOSIT
        ? poolAccount.account_number
        : account.account_number;
    const recipient_name =
      trxDto.type == TransactionTypes.DEPOSIT
        ? account.account_name
        : poolAccount.account_name;
    const recipient_accountNumber =
      trxDto.type == TransactionTypes.DEPOSIT
        ? trxDto.account_number
        : poolAccount.account_number;
    const trxAction =
      trxDto.type == TransactionTypes.DEPOSIT ? "deposited" : "paid out";
    return {
      type: trxDto.type,
      amount: trxDto.amount,
      ini_reference: trxDto.ini_reference,
      initiator_name,
      initiator_accountNumber,
      recipient_name,
      recipient_accountNumber,
      narration: `A total sum of ${account.currency} ${trxDto.amount} ${trxAction}`,
    };
  }

  async reversal(reverseTrxDto: ReverseTrxDto): Promise<Transactions[]> {
    const reversed = await this.transactionRepo.findOneBy({
      payment_ref: reverseTrxDto.payment_ref,
      type: TransactionTypes.REVERSAL,
    });
    if (reversed) throw new BadRequestException("Already reversed.");
    const db = this.transactionRepo.createQueryBuilder("t1");
    let trxTobeReverseds = await db
      .where(
        "t1.id IN " +
          db
            .subQuery()
            .select("MAX(id)", "id")
            .from(Transactions, "trx")
            .where("payment_ref = :ref", { ref: reverseTrxDto.payment_ref })
            .groupBy("type")
            .getQuery()
      )
      .setParameter("registered", true)
      .getMany();

    if (!trxTobeReverseds)
      throw new BadRequestException("Transaction not found.");
    let reversedTransaction: Transactions[] = [];
    for (let trx of trxTobeReverseds) {
      this.getReversalPayLoad(trx, reverseTrxDto);
      reversedTransaction.push(
        await this.initiate(
          this.getReversalPayLoad(trx, reverseTrxDto),
          trx.payment_ref
        )
      );
    }

    return reversedTransaction;
  }

  getReversalPayLoad(transaction: Transactions, reverseParam: ReverseTrxDto) {
    return {
      type: TransactionTypes.REVERSAL,
      amount: transaction.amount,
      ini_reference: transaction.ini_reference,
      initiator_name: transaction.recipient_name,
      initiator_accountNumber: transaction.recipient_accountNumber,
      recipient_name: transaction.initiator_name,
      recipient_accountNumber: transaction.initiator_accountNumber,
      narration: reverseParam.narration,
    };
  }
  async getLifeTransactionSummary() {
    const queryRunner = this.dabaseSource.createQueryRunner();
    return await queryRunner.query(
      `SELECT type, SUM(ABS(amount)) AS amount FROM transactions GROUP BY type`
    );
  }
}
