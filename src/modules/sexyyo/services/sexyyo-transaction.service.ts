import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, In, Repository } from "typeorm";
import { Account } from "src/modules/account/entities/account.entity";
import { Transactions } from "src/modules/transactions/entities/transaction.entity";
import {
  AccountTypes,
  Currency,
} from "src/modules/account/dto/account.dto";
import {
  TransactionStatus,
  TransactionTypes,
} from "src/modules/transactions/transactionEnum/transaction.enum";
import {
  SexyyoCheckoutDto,
  SexyyoDepositDto,
  SexyyoTransferDto,
} from "../dto/sexyyo-transaction.dto";
import { SexyyoAuthService } from "./sexyyo-auth.service";

@Injectable()
export class SexyyoTransactionService {
  constructor(
    @InjectRepository(Account) private accountRepo: Repository<Account>,
    @InjectRepository(Transactions)
    private transactionRepo: Repository<Transactions>,
    private dataSource: DataSource,
    private authService: SexyyoAuthService
  ) {}

  async checkout(userId: number, dto: SexyyoCheckoutDto) {
    const userAccount = await this.accountRepo.findOne({
      where: {
        user_id: userId,
        currency: dto.currency,
        type: AccountTypes.SAVING,
      },
    });

    if (!userAccount) {
      throw new BadRequestException(
        `Wallet for currency ${dto.currency} not found on your profile.`
      );
    }

    const currentBalance = parseFloat(userAccount.balance?.toString() || "0");
    if (currentBalance < dto.amount) {
      throw new BadRequestException({
        statusCode: 400,
        error: "INSUFFICIENT_FUNDS",
        message: `Insufficient balance in your ${dto.currency} wallet. Current balance: ${currentBalance.toFixed(
          2
        )} ${dto.currency}. Required: ${dto.amount.toFixed(2)} ${dto.currency}.`,
        currentBalance,
        requiredAmount: dto.amount,
        currency: dto.currency,
      });
    }

    if (dto.pin) {
      const pinValid = await this.authService.verifyPin(userId, dto.pin);
      if (!pinValid) {
        throw new BadRequestException("Invalid transaction PIN.");
      }
    }

    const poolAccount = await this.accountRepo.findOne({
      where: { currency: dto.currency, type: AccountTypes.POOL },
    });

    if (!poolAccount) {
      throw new BadRequestException(
        `Platform settlement pool for ${dto.currency} is currently unavailable.`
      );
    }

    const paymentRef = this.generateRef("CHK");
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const userOpeningBalance = currentBalance;
      const userClosingBalance = userOpeningBalance - Math.abs(dto.amount);
      userAccount.balance = userClosingBalance;
      await queryRunner.manager.save(Account, userAccount);

      const poolOpeningBalance = parseFloat(
        poolAccount.balance?.toString() || "0"
      );
      const poolClosingBalance = poolOpeningBalance + Math.abs(dto.amount);
      poolAccount.balance = poolClosingBalance;
      await queryRunner.manager.save(Account, poolAccount);

      const narration =
        dto.narration || `Marketplace checkout for order #${dto.order_id}`;

      // User Debit Record
      const userDebitTrx = queryRunner.manager.create(Transactions, {
        account_number: userAccount.account_number,
        type: TransactionTypes.PAYOUT,
        status: TransactionStatus.SUCCESSFUL,
        opening_balance: userOpeningBalance,
        amount: -Math.abs(dto.amount),
        closing_balance: userClosingBalance,
        payment_ref: paymentRef,
        initiator_name: userAccount.account_name,
        initiator_accountNumber: userAccount.account_number,
        recipient_name: poolAccount.account_name,
        recipient_accountNumber: poolAccount.account_number,
        narration,
        description: `Debited ${dto.currency} ${dto.amount} for checkout`,
        ini_reference: dto.order_id,
      });

      // Pool Credit Record
      const poolCreditTrx = queryRunner.manager.create(Transactions, {
        account_number: poolAccount.account_number,
        type: TransactionTypes.DEPOSIT,
        status: TransactionStatus.SUCCESSFUL,
        opening_balance: poolOpeningBalance,
        amount: Math.abs(dto.amount),
        closing_balance: poolClosingBalance,
        payment_ref: paymentRef,
        initiator_name: userAccount.account_name,
        initiator_accountNumber: userAccount.account_number,
        recipient_name: poolAccount.account_name,
        recipient_accountNumber: poolAccount.account_number,
        narration: `Received payment for order #${dto.order_id}`,
        description: `Credited ${dto.currency} ${dto.amount} from checkout`,
        ini_reference: dto.order_id,
      });

      await queryRunner.manager.save(Transactions, [
        userDebitTrx,
        poolCreditTrx,
      ]);

      await queryRunner.commitTransaction();

      return {
        success: true,
        message: "Payment successfully processed.",
        reference: paymentRef,
        order_id: dto.order_id,
        amount: dto.amount,
        currency: dto.currency,
        new_balance: userClosingBalance,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(
        `Checkout payment failed: ${err.message || "Unknown error"}`
      );
    } finally {
      await queryRunner.release();
    }
  }

  async depositTopUp(dto: SexyyoDepositDto) {
    const userAccount = await this.accountRepo.findOne({
      where: { account_number: dto.account_number, currency: dto.currency },
    });

    if (!userAccount) {
      throw new NotFoundException(
        `Account ${dto.account_number} not found for currency ${dto.currency}.`
      );
    }

    const poolAccount = await this.accountRepo.findOne({
      where: { currency: dto.currency, type: AccountTypes.POOL },
    });

    if (!poolAccount) {
      throw new BadRequestException(
        `Pool account for ${dto.currency} not found.`
      );
    }

    const paymentRef = dto.reference || this.generateRef("DEP");
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const userOpening = parseFloat(userAccount.balance?.toString() || "0");
      const userClosing = userOpening + Math.abs(dto.amount);
      userAccount.balance = userClosing;
      await queryRunner.manager.save(Account, userAccount);

      const poolOpening = parseFloat(poolAccount.balance?.toString() || "0");
      const poolClosing = poolOpening - Math.abs(dto.amount);
      poolAccount.balance = poolClosing;
      await queryRunner.manager.save(Account, poolAccount);

      const narration =
        dto.narration ||
        `Wallet top-up deposit of ${dto.currency} ${dto.amount}`;

      // User Credit
      const userCredit = queryRunner.manager.create(Transactions, {
        account_number: userAccount.account_number,
        type: TransactionTypes.DEPOSIT,
        status: TransactionStatus.SUCCESSFUL,
        opening_balance: userOpening,
        amount: Math.abs(dto.amount),
        closing_balance: userClosing,
        payment_ref: paymentRef,
        initiator_name: poolAccount.account_name,
        initiator_accountNumber: poolAccount.account_number,
        recipient_name: userAccount.account_name,
        recipient_accountNumber: userAccount.account_number,
        narration,
        description: `Deposit credited to ${userAccount.account_number}`,
        ini_reference: paymentRef,
      });

      // Pool Debit
      const poolDebit = queryRunner.manager.create(Transactions, {
        account_number: poolAccount.account_number,
        type: TransactionTypes.PAYOUT,
        status: TransactionStatus.SUCCESSFUL,
        opening_balance: poolOpening,
        amount: -Math.abs(dto.amount),
        closing_balance: poolClosing,
        payment_ref: paymentRef,
        initiator_name: poolAccount.account_name,
        initiator_accountNumber: poolAccount.account_number,
        recipient_name: userAccount.account_name,
        recipient_accountNumber: userAccount.account_number,
        narration,
        description: `Deposit float debited to fund ${userAccount.account_number}`,
        ini_reference: paymentRef,
      });

      await queryRunner.manager.save(Transactions, [userCredit, poolDebit]);
      await queryRunner.commitTransaction();

      return {
        success: true,
        message: "Wallet topped up successfully.",
        account_number: userAccount.account_number,
        currency: dto.currency,
        amount: dto.amount,
        balance: userClosing,
        reference: paymentRef,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(`Top-up failed: ${err.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  async getUserTransactionHistory(userId: number, limit = 20, offset = 0) {
    const userAccounts = await this.accountRepo.find({
      where: { user_id: userId },
      select: ["account_number"],
    });

    if (!userAccounts.length) {
      return { items: [], total: 0 };
    }

    const accountNumbers = userAccounts.map((a) => a.account_number);

    const [items, total] = await this.transactionRepo.findAndCount({
      where: { account_number: In(accountNumbers) },
      order: { id: "DESC" },
      take: limit,
      skip: offset,
    });

    return {
      items: items.map((trx) => ({
        id: trx.id,
        payment_ref: trx.payment_ref,
        amount: parseFloat(trx.amount?.toString() || "0"),
        opening_balance: parseFloat(trx.opening_balance?.toString() || "0"),
        closing_balance: parseFloat(trx.closing_balance?.toString() || "0"),
        type: trx.type,
        status: trx.status,
        narration: trx.narration,
        description: trx.description,
        initiator_name: trx.initiator_name,
        recipient_name: trx.recipient_name,
        created_at: trx.created_at,
      })),
      total,
      limit,
      offset,
    };
  }

  private generateRef(prefix = "TRX"): string {
    const timestamp = Date.now();
    const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `${prefix}-${timestamp}-${rand}`;
  }
}
