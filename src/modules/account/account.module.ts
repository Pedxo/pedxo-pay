import { Module } from "@nestjs/common";
import { AccountService } from "./services/account.service";
import { AccountController } from "./account.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Account } from "./entities/account.entity";
import { User } from "./entities/user.entity";
import { TransactionsModule } from "../transactions/transactions.module";
@Module({
  imports: [TypeOrmModule.forFeature([Account, User]), TransactionsModule],
  controllers: [AccountController],
  providers: [AccountService],
})
export class AccountModule {}
