import { IsNotEmpty, IsNumber } from "class-validator";
import { TransactionTypes } from "../transactionEnum/transaction.enum";

export class DepositDto {
  @IsNotEmpty()
  type: TransactionTypes;

  @IsNumber({ maxDecimalPlaces: 2 })
  amount: number;

  @IsNotEmpty()
  account_number: string;

  @IsNotEmpty()
  ini_reference: string;
}
