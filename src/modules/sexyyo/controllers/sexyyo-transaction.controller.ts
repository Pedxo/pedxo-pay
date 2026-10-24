import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { SexyyoTransactionService } from "../services/sexyyo-transaction.service";
import {
  SexyyoCheckoutDto,
  SexyyoDepositDto,
  SexyyoTransferDto,
  SexyyoWithdrawDto,
} from "../dto/sexyyo-transaction.dto";
import { SexyyoJwtGuard } from "../guards/sexyyo-jwt.guard";
import { CurrentUser } from "../guards/current-user.decorator";
import { User } from "src/modules/account/entities/user.entity";
import { Currency } from "src/modules/account/dto/account.dto";

@Controller("sexyyo/transaction")
export class SexyyoTransactionController {
  constructor(
    private readonly transactionService: SexyyoTransactionService
  ) {}

  @Post("checkout")
  @UseGuards(SexyyoJwtGuard)
  @HttpCode(HttpStatus.OK)
  async checkout(
    @CurrentUser() user: User,
    @Body() dto: SexyyoCheckoutDto
  ) {
    return this.transactionService.checkout(user.id, dto);
  }

  @Post("transfer")
  @UseGuards(SexyyoJwtGuard)
  @HttpCode(HttpStatus.OK)
  async transfer(
    @CurrentUser() user: User,
    @Body() dto: SexyyoTransferDto
  ) {
    return this.transactionService.transfer(user.id, dto);
  }

  @Post("withdraw")
  @UseGuards(SexyyoJwtGuard)
  @HttpCode(HttpStatus.OK)
  async withdraw(
    @CurrentUser() user: User,
    @Body() dto: SexyyoWithdrawDto
  ) {
    return this.transactionService.withdraw(user.id, dto);
  }

  @Get("lookup-recipient")
  @UseGuards(SexyyoJwtGuard)
  async lookupRecipient(
    @Query("query") query: string,
    @Query("currency") currency: Currency
  ) {
    return this.transactionService.lookupRecipient(query, currency);
  }

  @Get("history")
  @UseGuards(SexyyoJwtGuard)
  async getHistory(
    @CurrentUser() user: User,
    @Query("limit") limit?: number,
    @Query("offset") offset?: number
  ) {
    return this.transactionService.getUserTransactionHistory(
      user.id,
      limit ? Number(limit) : 20,
      offset ? Number(offset) : 0
    );
  }

  @Post("deposit-topup")
  @HttpCode(HttpStatus.OK)
  async depositTopUp(@Body() dto: SexyyoDepositDto) {
    // Allows admin / operator to credit user wallets directly
    return this.transactionService.depositTopUp(dto);
  }
}
