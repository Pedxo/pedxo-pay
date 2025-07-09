import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Account } from "./account.entity";
import { Exclude } from "class-transformer";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => Account, (account) => account.user, { eager: true })
  accounts: Account[];

  @Column({ unique: true })
  email: string;

  @Exclude({ toPlainOnly: true })
  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  first_name: string;

  @Column({ nullable: true })
  last_name: string;

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
