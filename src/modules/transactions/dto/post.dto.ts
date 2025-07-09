import {
  TransactionStatus,
  TransactionTypes,
} from "../transactionEnum/transaction.enum";
import { IsNotEmpty, IsNumber } from "class-validator";

export class PosBalanceRes {
  opening_balance: number;
  closing_balance: number;
}

export class PostTrxDTO {
  @IsNotEmpty()
  account_number: string;

  @IsNotEmpty()
  type: TransactionTypes;

  @IsNotEmpty()
  status: TransactionStatus;

  @IsNumber({ maxDecimalPlaces: 2 })
  opening_balance: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  amount: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  closing_balance: number;

  @IsNotEmpty()
  payment_ref: string;

  @IsNotEmpty()
  initiator_name: string;

  @IsNotEmpty()
  initiator_accountNumber: string;

  @IsNotEmpty()
  recipient_name: string;

  @IsNotEmpty()
  recipient_accountNumber: string;

  @IsNotEmpty()
  narration: string;

  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  ini_reference: string;
}
