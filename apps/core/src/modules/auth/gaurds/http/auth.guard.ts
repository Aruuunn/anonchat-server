import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import {AccessTokenService} from '../../jwttoken/access-token.service';
import {BaseGuard} from '../base-guard';
import {isValidJwt} from '../../../../utils/is-valid-jwt';
import {RefreshTokenService} from '../../jwttoken/refresh-token.service';
import {UserService} from '../../../user/user.service';

@Injectable()
export class AuthGuard extends BaseGuard implements CanActivate {
    constructor(
        accessTokenService: AccessTokenService,
        refreshTokenService: RefreshTokenService,
        userService: UserService,
    ) {
        super(accessTokenService, refreshTokenService, userService);
    }

    protected getRequest(context: ExecutionContext): any {
        return context.switchToHttp().getRequest();
    }

    protected getRefreshToken(context: ExecutionContext): string | undefined {
        const request = this.getRequest(context);
        const refreshToken = request?.cookies?.refreshToken;
        return isValidJwt(refreshToken) ? refreshToken : undefined;
    }

    protected getAccessToken(context: ExecutionContext): string | undefined {
        const request = this.getRequest(context);
        const accessToken = request?.headers?.authorization
            ?.trim()
            ?.split(' ')?.[1];
        return isValidJwt(accessToken) ? accessToken : undefined;
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
                const id = user.id;
                const newAccessToken = this.accessTokenService.generateTokenUsingId(
                    id,
                );
                this.attachNewPropertyToRequest('user', user, context);
                this.attachNewPropertyToRequest(
                    'newAccessToken',
                    newAccessToken,
                    context,
                );
            },
        );

        if (isRefreshTokenValid) {
            return true;
        }

        throw new UnauthorizedException();
    }
}
