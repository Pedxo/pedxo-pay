import { IsEmail, IsNotEmpty, IsOptional } from "class-validator";

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsOptional()
  password: string;

  @IsNotEmpty()
  first_name: string;

  @IsNotEmpty()
  last_name: string;

  @IsNotEmpty()
  currency: string;
}
