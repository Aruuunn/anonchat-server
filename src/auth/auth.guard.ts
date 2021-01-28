import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard as Guard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt-strategy';

@Injectable()
export class AuthGuard extends Guard('jwt') {
  constructor(
    private authService: AuthService,
    private jwtStratedy: JwtStrategy,
  ) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const refreshToken = request?.cookies?.refreshToken;
    return (super.canActivate(context) as Promise<boolean>)
      .catch(async (_) => {
        if (refreshToken) {
          const accessToken = this.authService.generateAccessTokenUsingRefreshToken(
            refreshToken,
          );
          const jwtPayload = this.authService.getJwtPayloadFromToken(
            accessToken,
          );
          const { user } = await this.jwtStratedy.validate(jwtPayload);
          request.user = user;
          request.newAccessToken = accessToken;
          return true;
        }
        throw new UnauthorizedException();
      })
      .catch(() => {
        throw new UnauthorizedException();
      });
  }
}
