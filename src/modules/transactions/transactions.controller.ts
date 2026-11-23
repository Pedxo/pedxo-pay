import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
} from "@nestjs/common";
import { TransactionsService } from "./transactions.service";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import {
  ReverseTrxDto,
  UpdateTransactionDto,
} from "./dto/update-transaction.dto";
import {
  GetAllTransactionDto,
  GetTrxByAccountDto,
} from "./dto/get-transaction-dto";
import { DepositDto } from "./dto/deposit.dto";
import { InitiateTrxResDto } from "./dto/post-response.dto";
import { plainToInstance } from "class-transformer";
import { TransactionTypes } from "./transactionEnum/transaction.enum";

@Controller("transaction")
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post("initiate")
  async initiate(
    @Body() dto: CreateTransactionDto,
  ): Promise<InitiateTrxResDto> {
    const trx = await this.transactionsService.initiate(dto);
    return plainToInstance(InitiateTrxResDto, trx);
  }

  @Post("deposit")
  async deposit(@Body() dto: DepositDto): Promise<InitiateTrxResDto> {
    const trx = await this.transactionsService.deposit(dto);
    return plainToInstance(InitiateTrxResDto, trx);
  }

  @Post("payout")
  async payout(@Body() dto: DepositDto): Promise<InitiateTrxResDto> {
    const trx = await this.transactionsService.deposit({
      ...dto,
      type: TransactionTypes.PAYOUT,
    });
    return plainToInstance(InitiateTrxResDto, trx);
  }

  @Post("reverse")
  async executeReversal(
    @Body() param: ReverseTrxDto,
  ): Promise<InitiateTrxResDto[]> {
    const trxs = await this.transactionsService.reversal(param);
    return plainToInstance(InitiateTrxResDto, trxs);
  }

  @Get()
  getAll(@Query() qeury: GetAllTransactionDto) {
    return this.transactionsService.getAllTransaction(qeury);
  }

  @Get("summary")
  getSummary() {
    return this.transactionsService.getLifeTransactionSummary();
  }

  @Get("user-account-summary/:account_number")
  getAccountSummary(@Param() accDto: GetTrxByAccountDto) {
    return this.transactionsService.getAccountSummary(accDto);
  }

  @Get(":account_number")
  getTransactionByAcc(
    @Param() account_number: GetTrxByAccountDto,
    @Query() qeury: GetAllTransactionDto,
  ) {
    return this.transactionsService.getTransactionByAcc(account_number, qeury);
  }

  // @Post("reverse")
  // executeReversal(@Body() param: ReverseTrxDto): InitiateTrxResDto {
  //   return plainToInstance(
  //     InitiateTrxResDto,
  //     this.transactionsService.reversal(param),
  //   );
  // }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(+id, updateTransactionDto);
  }
}
