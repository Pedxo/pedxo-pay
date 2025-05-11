import { Account } from "src/modules/account/entities/account.entity";
import { PosBalanceRes } from "./post.dto";
import { IsNotEmpty } from "class-validator";
import { Exclude, Expose } from "class-transformer";

export class PostToAccResponse {
  @IsNotEmpty()
  account: Account;
  @IsNotEmpty()
  balanceRes: PosBalanceRes;
}

@Exclude()
export class InitiateTrxResDto {
  @Expose()
  status: string;

  @Expose()
  type: string;

  @Expose()
  payment_ref: string;

  @Expose()
  ini_reference: string;
}
