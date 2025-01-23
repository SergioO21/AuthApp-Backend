import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { JwtPayload } from "../interfaces";
import * as process from "node:process";
import { AuthService } from "../auth.service";
import { User } from "../entities";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private authService: AuthService
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException("There is no bearer token");
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: process.env.JWT_SECRET,
      });

      const user: User | undefined = await this.authService.findUserById(
        payload.id
      );
      if (!user) throw new UnauthorizedException("User not found");
      if (!user.isActive) throw new UnauthorizedException("User is not active");

      request["user"] = user;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException(error.message);
      }
      throw new UnauthorizedException("Invalid token");
    }

    return true;
  }

  private extractTokenFromHeader(req: Request): string | undefined {
    const authHeader = (req.headers["authorization"] as string) ?? undefined;

    if (!authHeader) return undefined;

    const [type, token] = authHeader.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }
}
