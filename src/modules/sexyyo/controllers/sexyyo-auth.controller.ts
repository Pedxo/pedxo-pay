import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from "@nestjs/common";
import { SexyyoAuthService } from "../services/sexyyo-auth.service";
import {
  SexyyoLoginDto,
  SexyyoRegisterDto,
  SexyyoSetPinDto,
  SexyyoVerifyOtpDto,
} from "../dto/sexyyo-auth.dto";
import { SexyyoJwtGuard } from "../guards/sexyyo-jwt.guard";
import { CurrentUser } from "../guards/current-user.decorator";
import { User } from "src/modules/account/entities/user.entity";

@Controller("sexyyo/auth")
export class SexyyoAuthController {
  constructor(private readonly authService: SexyyoAuthService) {}

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: SexyyoRegisterDto) {
    return this.authService.register(dto);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: SexyyoLoginDto) {
    return this.authService.login(dto);
  }

  @Get("me")
  @UseGuards(SexyyoJwtGuard)
  async getMe(@CurrentUser() user: User) {
    return this.authService.getMe(user.id);
  }

  @Post("pin")
  @UseGuards(SexyyoJwtGuard)
  @HttpCode(HttpStatus.OK)
  async setPin(@CurrentUser() user: User, @Body() dto: SexyyoSetPinDto) {
    return this.authService.setPin(user.id, dto);
  }

  @Post("verify-otp")
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() dto: SexyyoVerifyOtpDto) {
    // Allows simulated OTP verification (or standard default "123456")
    const isValid = dto.otp === "123456" || dto.otp.length === 6;
    return {
      success: isValid,
      message: isValid
        ? "Email successfully verified."
        : "Invalid verification code.",
    };
  }
}
