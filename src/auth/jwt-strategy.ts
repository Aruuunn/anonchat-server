import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ACCESS_TOKEN_SECRET } from '../config/jwt.config';
import { JwtPayload } from './jwt-payload';
import { UserDocument } from '../user/user.model';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super({
      secretOrKey: ACCESS_TOKEN_SECRET,
      ignoreExpiration: false,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: JwtPayload): Promise<{ user: UserDocument }> {
    const user = await this.userService.findUserUsingEmail(payload?.email);

    if (!user) {
      throw new UnauthorizedException();
    }
    return { user };
  }
}
