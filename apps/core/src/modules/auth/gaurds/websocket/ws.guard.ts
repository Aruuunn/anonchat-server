import { Injectable, ExecutionContext } from '@nestjs/common';
import { Socket } from 'socket.io';
import { parse as parseCookies } from 'cookie';
import { AuthGuard } from '../http/auth.guard';
import { isValidJwt } from '../../../../utils/is-valid-jwt';
import { UnAuthorizedWsException } from '../../../../common/websockets/exceptions/ws-exception';
import { Events } from '../../../../common/websockets/enum/ws-events.enum';

@Injectable()
export class WsGuard extends AuthGuard {
  getRequest(context: ExecutionContext): any {
    return context.switchToWs().getClient<Socket>().request;
  }

  getAccessToken(context: ExecutionContext): string | undefined {
    const socket = context.switchToWs().getClient<Socket>();
    const accessToken = socket?.handshake?.query?.accessToken;
    return isValidJwt(accessToken) ? accessToken : undefined;
  }

  getRefreshToken(context: ExecutionContext): string | undefined {
    const request = this.getRequest(context);
    const cookies =
      typeof request?.cookies === 'string'
        ? parseCookies(request?.cookies || '')
        : request?.cookies;
    const refreshToken = cookies?.refreshToken;
    return isValidJwt(refreshToken) ? refreshToken : undefined;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isAccessTokenValid: boolean = await this.validateAccessToken(
      context,
      async (user) => {
        this.attachNewPropertyToRequest('user', user, context);
      },
    );
    if (isAccessTokenValid) {
      return true;
    }

    const isRefreshTokenValid = await this.validateRefreshToken(
      context,
      async (user) => {
        const email = user.email;
        const newAccessToken = await this.accessTokenService.generateTokenUsingEmail(
          email,
        );
        const socket = context.switchToWs().getClient<Socket>();
        socket.emit(Events.NEW_ACCESS_TOKEN, { accessToken: newAccessToken });
      },
    );

    if (isRefreshTokenValid) {
      return true;
    }
    throw new UnAuthorizedWsException();
  }
}
