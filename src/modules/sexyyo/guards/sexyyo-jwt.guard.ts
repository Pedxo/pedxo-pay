import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "src/modules/account/entities/user.entity";

@Injectable()
export class SexyyoJwtGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User) private userRepo: Repository<User>
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers["authorization"];

    if (!authHeader) {
      throw new UnauthorizedException("Authorization header is required");
    }

    const [type, token] = authHeader.split(" ");
    if (type !== "Bearer" || !token) {
      throw new UnauthorizedException("Invalid token format. Must be Bearer <token>");
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || "pedxo_sexyyo_portal_secret_key_2026",
      });

      const user = await this.userRepo.findOne({
        where: { id: payload.sub },
        relations: ["accounts"],
      });

      if (!user) {
        throw new UnauthorizedException("User no longer exists");
      }

      request.user = user;
      return true;
    } catch (err) {
      throw new UnauthorizedException("Session expired or invalid token. Please log in again.");
    }
  }
}
