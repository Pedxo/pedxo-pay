import { IsNotEmpty } from "class-validator";
import { User } from "../entities/user.entity";

export class GetUserDto {
  @IsNotEmpty()
  items: User[];

  @IsNotEmpty()
  total: number;
}

export class GetUserByEmailDto {
  @IsNotEmpty()
  email: string;
}
