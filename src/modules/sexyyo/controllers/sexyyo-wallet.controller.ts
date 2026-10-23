import {
  Controller,
  Get,
  Query,
  UseGuards,
} from "@nestjs/common";
import { SexyyoWalletService } from "../services/sexyyo-wallet.service";
import { SexyyoJwtGuard } from "../guards/sexyyo-jwt.guard";
import { CurrentUser } from "../guards/current-user.decorator";
import { User } from "src/modules/account/entities/user.entity";
import { Currency } from "src/modules/account/dto/account.dto";

@Controller("sexyyo/wallet")
export class SexyyoWalletController {
  constructor(private readonly walletService: SexyyoWalletService) {}

  @Get("balances")
  @UseGuards(SexyyoJwtGuard)
  async getBalances(@CurrentUser() user: User) {
    return this.walletService.getUserBalances(user.id);
  }

  @Get("deposit-info")
  async getDepositInfo(@Query("currency") currency?: Currency) {
    return this.walletService.getDepositInfo(currency);
  }
}
