import { Injectable } from "@nestjs/common";
import { TransactionsService } from "src/modules/transactions/transactions.service";
import { AccountService } from "./account.service";

@Injectable()
export default class Post {
  constructor(
    private accountService: AccountService,
    private transactionService: TransactionsService
  ) {}

  async initiateTransaction() {}
  async postTransaction() {}
}
