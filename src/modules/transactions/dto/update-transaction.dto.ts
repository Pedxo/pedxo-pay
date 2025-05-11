import { PartialType } from "@nestjs/mapped-types";
import { CreateTransactionDto } from "./create-transaction.dto";
import { IsNotEmpty, IsOptional } from "class-validator";
import { TransactionTypes } from "../transactionEnum/transaction.enum";

export class UpdateTransactionDto extends PartialType(CreateTransactionDto) {}

export class ReverseTrxDto {
  @IsNotEmpty()
  payment_ref: string;

  @IsOptional()
  narration: string = "Reversal";
}
