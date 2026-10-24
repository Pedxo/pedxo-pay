import { IsEmail, IsNotEmpty, IsOptional, Length, MinLength } from "class-validator";

export class SexyyoRegisterDto {
  @IsEmail({}, { message: "Please provide a valid email address." })
  email: string;

  @IsNotEmpty()
  @MinLength(6, { message: "Password must be at least 6 characters long." })
  password: string;

  @IsOptional()
  first_name?: string;

  @IsOptional()
  last_name?: string;

  @IsOptional()
  @Length(4, 6, { message: "PIN must be between 4 and 6 digits." })
  transaction_pin?: string;
}

export class SexyyoLoginDto {
  @IsEmail({}, { message: "Please provide a valid email address." })
  email: string;

  @IsNotEmpty()
  password: string;
}

export class SexyyoSetPinDto {
  @IsNotEmpty()
  @Length(4, 6, { message: "PIN must be between 4 and 6 digits." })
  pin: string;
}

export class SexyyoVerifyOtpDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  otp: string;
}
