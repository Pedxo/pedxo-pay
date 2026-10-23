import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule } from "@nestjs/jwt";
import { User } from "../account/entities/user.entity";
import { Account } from "../account/entities/account.entity";
import { Transactions } from "../transactions/entities/transaction.entity";
import { SexyyoAuthController } from "./controllers/sexyyo-auth.controller";
import { SexyyoWalletController } from "./controllers/sexyyo-wallet.controller";
import { SexyyoTransactionController } from "./controllers/sexyyo-transaction.controller";
import { SexyyoAuthService } from "./services/sexyyo-auth.service";
import { SexyyoWalletService } from "./services/sexyyo-wallet.service";
import { SexyyoTransactionService } from "./services/sexyyo-transaction.service";
import { SexyyoJwtGuard } from "./guards/sexyyo-jwt.guard";

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Account, Transactions]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || "pedxo_sexyyo_portal_secret_key_2026",
      signOptions: { expiresIn: "7d" },
    }),
  ],
  controllers: [
    SexyyoAuthController,
    SexyyoWalletController,
    SexyyoTransactionController,
  ],
  providers: [
    SexyyoAuthService,
    SexyyoWalletService,
    SexyyoTransactionService,
    SexyyoJwtGuard,
  ],
  exports: [
    SexyyoAuthService,
    SexyyoWalletService,
    SexyyoTransactionService,
    SexyyoJwtGuard,
  ],
})
export class SexyyoModule {}
