import {Injectable, ExecutionContext, CanActivate} from '@nestjs/common';
import {Socket} from 'socket.io';
import {parse as parseCookies} from 'cookie';
import {isValidJwt, validateJwt} from '../../../../utils/is-valid-jwt';
import {UnAuthorizedWsException} from '../../../../common/websockets/exceptions/ws-exception';
import {WsEvents} from '../../../chat/ws-events';
import {BaseGuard} from '../base-guard';
import {AccessTokenService} from '../../jwttoken/access-token.service';
import {RefreshTokenService} from '../../jwttoken/refresh-token.service';
import {UserService} from '../../../user/user.service';
import {err, ok, Result} from 'neverthrow';
import {TokenErrorFactory, TokenErrorsEnum} from '../../jwttoken/token.exceptions';
import {Failure} from '../../../../common/failure.interface';

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

    protected getAccessToken(context: ExecutionContext): Result<string, Failure<any>> {
        const socket = context.switchToWs().getClient<Socket>();
        const accessToken = socket?.handshake?.query?.accessToken;
        return validateJwt(accessToken);
    }

    protected getRefreshToken(context: ExecutionContext): Result<string, Failure<any>> {
        const request = this.getRequest(context);
        const cookies = parseCookies(request?.headers?.cookie || '');
        const refreshToken = cookies?.refreshToken;
        return validateJwt(refreshToken);
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
                const newAccessToken: string = this.accessTokenService.generateTokenUsingId(
                    id,
                );
                this.attachNewPropertyToRequest('user', user, context);
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
