import {Injectable, ExecutionContext, CanActivate} from '@nestjs/common';
import {Socket} from 'socket.io';
import {parse as parseCookies} from 'cookie';
import {isValidJwt} from '../../../../utils/is-valid-jwt';
import {UnAuthorizedWsException} from '../../../../common/websockets/exceptions/ws-exception';
import {WsEvents} from '../../../chat/ws-events';
import {BaseGuard} from '../base-guard';
import {AccessTokenService} from '../../jwttoken/access-token.service';
import {RefreshTokenService} from '../../jwttoken/refresh-token.service';
import {UserService} from '../../../user/user.service';

@Injectable()
export class WsGuard extends BaseGuard implements CanActivate {
    constructor(
        accessTokenService: AccessTokenService,
        refreshTokenService: RefreshTokenService,
        userService: UserService
    ) {
        super(accessTokenService, refreshTokenService, userService);
    }

    protected getRequest(context: ExecutionContext): any {
        return context.switchToWs().getClient<Socket>().request;
    }

    protected getAccessToken(context: ExecutionContext): string | undefined {
        const socket = context.switchToWs().getClient<Socket>();
        const accessToken = socket?.handshake?.query?.accessToken;
        return isValidJwt(accessToken) ? accessToken : undefined;
    }

    protected getRefreshToken(context: ExecutionContext): string | undefined {
        const request = this.getRequest(context);
        const cookies =
            typeof request?.cookies === 'string'
                ? parseCookies(request?.cookies || '')
                : request?.cookies;
        const refreshToken = cookies?.refreshToken;
        return isValidJwt(refreshToken) ? refreshToken : undefined;
    }

    public async canActivate(context: ExecutionContext): Promise<boolean> {

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
                const id = user.id;
                const newAccessToken = await this.accessTokenService.generateTokenUsingId(
                    id,
                );
                const socket = context.switchToWs().getClient<Socket>();
                socket.emit(WsEvents.NEW_ACCESS_TOKEN, {accessToken: newAccessToken});
            },
        );

        if (isRefreshTokenValid) {
            return true;
        }

        throw new UnAuthorizedWsException();
    }
}

export default WsGuard;
