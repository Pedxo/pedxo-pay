import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./user.entity";
import { AccountTypes, Currency } from "../dto/account.dto";

@Entity()
export class Account {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.accounts)
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column()
  user_id: number;

  @Column({ nullable: false, unique: true })
  account_number: string;

  @Column({ nullable: false })
  account_name: string;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  balance: number;

  @Column({
    type: "enum",
    enum: Currency,
    default: Currency.NGN,
  })
  currency: string;

  @Column({
    type: "enum",
    enum: AccountTypes,
    default: AccountTypes.SAVING,
  })
  type: string;

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
