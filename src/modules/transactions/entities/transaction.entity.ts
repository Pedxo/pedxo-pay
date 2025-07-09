import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

import {
  TransactionStatus,
  TransactionTypes,
} from "../transactionEnum/transaction.enum";
import { Currency } from "src/modules/account/dto/account.dto";

@Entity()
export class Transactions {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  account_number: string;

  @Column()
  type: TransactionTypes;

  @Column()
  status: TransactionStatus;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  opening_balance: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  amount: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  closing_balance: number;

  @Column({ unique: false, nullable: true })
  payment_ref: string;

  @Column()
  initiator_name: string;

  @Column()
  initiator_accountNumber: string;

  @Column()
  recipient_name: string;

  @Column()
  recipient_accountNumber: string;

  @Column({ default: "TF" })
  narration: string;

  @Column({ default: "TF" })
  description: string;

  @Column({ unique: false, nullable: true })
  ini_reference: string;
  @Column({
    type: "enum",
    enum: Currency,
  })
  currency: Currency;

  @CreateDateColumn({
    type: "timestamp",
    precision: 0,
    default: () => "CURRENT_TIMESTAMP(0)",
  })
  public created_at: Date;

  @UpdateDateColumn({
    type: "timestamp",
    precision: 0,
    default: () => "CURRENT_TIMESTAMP(0)",
    onUpdate: "CURRENT_TIMESTAMP(0)",
  })
  public updated_at: Date;
}
