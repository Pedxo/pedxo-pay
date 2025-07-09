import { IsNotEmpty, IsOptional } from "class-validator";
import { DbSort } from "../transactionEnum/transaction.enum";

export class GetAllTransactionDto {
  @IsOptional()
  take: number;
  @IsOptional()
  skip: number;
  @IsOptional()
  order: DbSort;
}

export class GetTrxByAccountDto {
  @IsNotEmpty()
  account_number: string;
}
