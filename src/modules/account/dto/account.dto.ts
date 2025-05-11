import { PartialType } from "@nestjs/mapped-types";
import { CreateUserDto } from "./create-user.dto";
import { IsNotEmpty, IsNumber } from "class-validator";

export class UpdateAccountDto extends PartialType(CreateUserDto) {}
export class GetAccountByIdDto {
  @IsNotEmpty()
  id: number;
}
export class GetAccByAccNumDto {
  @IsNotEmpty()
  account_number: string;
}
export class GetBalanceResdDto {
  @IsNotEmpty()
  balance: string | null;
  account_number: string | null;
}

export class CreateAccountDto {
  @IsNotEmpty()
  account_name: string;

  @IsNotEmpty()
  currency: string;

  @IsNotEmpty()
  type: AccountTypes;

  @IsNumber()
  user_id: number;
}

export enum AccountTypes {
  POOL = "pool",
  SAVING = "saving",
}

export enum Currency {
  NGN = "NGN",
  USD = "USD",
}
