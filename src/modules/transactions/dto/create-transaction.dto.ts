import { IsNotEmpty, IsNumber, IsOptional } from "class-validator";
import { TransactionTypes } from "../transactionEnum/transaction.enum";

export class CreateTransactionDto {
  @IsNotEmpty()
  type: TransactionTypes;

  @IsNumber({ maxDecimalPlaces: 2 })
  amount: number;

  @IsNotEmpty()
  ini_reference: string;

  @IsNotEmpty()
  initiator_name: string;

  @IsNotEmpty()
  initiator_accountNumber: string;

  @IsNotEmpty()
  recipient_name: string;

  @IsNotEmpty()
  recipient_accountNumber: string;

  @IsOptional()
  narration: string;
}
