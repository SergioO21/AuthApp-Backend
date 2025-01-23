import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateUserDto, LoginDto, RegisterDto } from "./dto";
import { AuthGuard } from "./guards";
import { User } from "./entities";
import { LoginResponse } from "./interfaces";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post("/register")
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post("/login")
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll(@Request() req: Request): User {
    return req["user"] as User;
  }

  @UseGuards(AuthGuard)
  @Get("/check-token")
  checkToken(@Request() req: Request): LoginResponse {
    const user = req["user"] as User;
    return {
      user: user,
      token: this.authService.getJWTToken({ id: user._id as string }),
    };
  }
}
