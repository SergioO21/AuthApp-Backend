import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";

import { CreateUserDto, LoginDto, RegisterDto } from "./dto";
import { User } from "./entities";
import { JwtPayload, LoginResponse } from "./interfaces";

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private jwtService: JwtService
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const { password, ...userData } = createUserDto;

      const newUser = new this.userModel({
        password: bcrypt.hashSync(password, 10),
        ...userData,
      });

      await newUser.save();

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...user } = newUser.toJSON();

      return user;
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.code === 11000) {
        throw new BadRequestException(
          `${createUserDto.email} is already exist`
        );
      }

      throw new BadRequestException(error);
    }
  }

  async register(registerDto: RegisterDto): Promise<LoginResponse> {
    const user = await this.create(registerDto);

    return {
      user,
      token: this.getJWTToken({ id: String(user._id) }),
    };
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException("Not valid credentials - email");
    }

    if (user.password && !bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException("Not valid credentials - password");
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...rest } = user.toJSON();

    return {
      user: rest,
      token: this.getJWTToken({ id: String(user.id) }),
    };
  }

  async findUserById(id: string): Promise<User | undefined> {
    const user = await this.userModel.findById(id);

    if (!user) return undefined;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...rest } = user.toJSON();
    return rest;
  }

  getJWTToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload);
  }
}
