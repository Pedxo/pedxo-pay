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

@Controller("transaction")
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post("initiate")
  initiate(
    @Body() createTransactionDto: CreateTransactionDto
  ): InitiateTrxResDto {
    return plainToInstance(
      InitiateTrxResDto,
      this.transactionsService.initiate(createTransactionDto)
    );
  }

  @Post("deposit")
  deposit(@Body() depositDto: DepositDto): InitiateTrxResDto {
    return plainToInstance(
      InitiateTrxResDto,
      this.transactionsService.deposit(depositDto)
    );
  }

  @Post("payout")
  payout(@Body() depositDto: DepositDto): InitiateTrxResDto {
    return plainToInstance(
      InitiateTrxResDto,
      this.transactionsService.deposit(depositDto)
    );
  }

  @Get()
  getAll(@Query() qeury: GetAllTransactionDto) {
    return this.transactionsService.getAllTransaction(qeury);
  }

  @Get("summary")
  getSummary() {
    return this.transactionsService.getLifeTransactionSummary();
  }

  @Get(":account_number")
  getTransactionByAcc(
    @Param() account_number: GetTrxByAccountDto,
    @Query() qeury: GetAllTransactionDto
  ) {
    return this.transactionsService.getTransactionByAcc(account_number, qeury);
  }

  @Post("reverse")
  executeReversal(@Body() param: ReverseTrxDto): InitiateTrxResDto {
    return plainToInstance(
      InitiateTrxResDto,
      this.transactionsService.reversal(param)
    );
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateTransactionDto: UpdateTransactionDto
  ) {
    return this.transactionsService.update(+id, updateTransactionDto);
  }
}
