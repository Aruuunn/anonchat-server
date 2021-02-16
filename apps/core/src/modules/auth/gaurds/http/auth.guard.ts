import {CanActivate, ExecutionContext, Injectable, UnauthorizedException,} from '@nestjs/common';
import {AccessTokenService} from '../../jwttoken/access-token.service';
import {BaseGuard} from '../base-guard';
import {validateJwt} from '../../../../utils/is-valid-jwt';
import {RefreshTokenService} from '../../jwttoken/refresh-token.service';
import {UserService} from '../../../user/user.service';
import {Result} from 'neverthrow';
import {Failure} from '../../../../common/failure.interface';
import {TokenErrorsEnum} from '../../jwttoken/token.exceptions';


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

    protected getRefreshToken(context: ExecutionContext): Result<string, Failure<TokenErrorsEnum.INVALID_JWT>> {
        const request = this.getRequest(context);
        const refreshToken = request?.cookies?.refreshToken;
        return validateJwt(refreshToken);
    }

    protected getAccessToken(context: ExecutionContext): Result<string, Failure<TokenErrorsEnum.INVALID_JWT>> {
        const request = this.getRequest(context);
        const accessToken = request?.headers?.authorization
            ?.trim()
            ?.split(' ')?.[1];
        return validateJwt(accessToken);
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
        } else {
            throw new UnauthorizedException();
        }
    }
}
