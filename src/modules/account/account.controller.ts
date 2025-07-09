import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseInterceptors,
  ClassSerializerInterceptor,
} from "@nestjs/common";
import { AccountService } from "./services/account.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { GetUserByEmailDto } from "./dto/get-all-user.dto";
import {
  CreateAccountDto,
  GetAccByAccNumDto,
  GetAccountByIdDto,
} from "./dto/account.dto";

@Controller("account")
@UseInterceptors(ClassSerializerInterceptor)
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.accountService.createUser(createUserDto);
  }

  @Post("/account")
  createAccount(@Body() createAccountDto: CreateAccountDto) {
    return this.accountService.createAccount(createAccountDto);
  }

  @Get("/users")
  findAll(@Query("limit") limit: number, @Query("offset") offset: number) {
    return this.accountService.getAllUser(limit, offset);
  }

  @Get("/users/:email")
  findOne(@Param() getOneUserDto: GetUserByEmailDto) {
    return this.accountService.getUser(getOneUserDto);
  }

  @Get("/balance/:account_number")
  getBalance(@Param() getAccByAccNumDto: GetAccByAccNumDto) {
    try {
      return this.accountService.getBalance(getAccByAccNumDto);
    } catch (error) {
      return error;
    }
  }
}
