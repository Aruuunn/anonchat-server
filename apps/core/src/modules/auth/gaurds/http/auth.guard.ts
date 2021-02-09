import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import {AccessTokenService} from '../../jwttoken/access-token.service';
import {UserService} from '../../../user/user.service';
import {isTruthy} from '../../../../utils/is-truthy.util';
import {RefreshTokenService} from '../../jwttoken/refresh-token.service';
import {JwtPayload} from '../../interfaces/jwt-payload.interface';
import {UserModel} from '../../../user/model/user.model';
import {isValidJwt} from '../../../../utils/is-valid-jwt';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        protected accessTokenService: AccessTokenService,
        private refreshTokenService: RefreshTokenService,
        private userService: UserService,
    ) {
    }

    protected getRequest(context: ExecutionContext): any {
        return context.switchToHttp().getRequest();
    }

    protected getRefreshToken(context: ExecutionContext): string | undefined {
        const request = this.getRequest(context);
        const refreshToken = request?.cookies?.refreshToken;
        return isValidJwt(refreshToken) ? refreshToken : undefined;
    }

    protected attachNewPropertyToRequest(
        propertyName: string,
        value: any,
        context: ExecutionContext,
    ): void {
        const request = this.getRequest(context);
        request[propertyName] = value;
    }

    protected getAccessToken(context: ExecutionContext): string | undefined {
        const request = this.getRequest(context);
        const accessToken = request?.headers?.authorization
            ?.trim()
            ?.split(' ')?.[1];
        return isValidJwt(accessToken) ? accessToken : undefined;
    }

    protected async validateToken(
        token: string,
        tokenValidator: (token: string) => JwtPayload | undefined,
        onValidated: (user: UserModel) => Promise<void>,
    ): Promise<boolean> {
        if (isTruthy(token)) {
            const {id} = tokenValidator(token);
            if (isTruthy(id)) {
                const user = await this.userService.findUserUsingId(id);
                if (isTruthy(user)) {
                    await onValidated(user);
                    return true;
                }
            }
        }
        return false;
    }

    protected async validateAccessToken(
        context: ExecutionContext,
        onValidated: (user: UserModel) => Promise<void>,
    ): Promise<boolean> {
        const accessToken = this.getAccessToken(context);
        return this.validateToken(
            accessToken,
            this.accessTokenService.verify.bind(this.accessTokenService),
            onValidated,
        );
    }

    protected async validateRefreshToken(
        context: ExecutionContext,
        onValidated: (user: UserModel) => Promise<void>,
    ): Promise<boolean> {
        const refreshToken = this.getRefreshToken(context);
        return this.validateToken(
            refreshToken,
            this.refreshTokenService.verify.bind(this.refreshTokenService),
            onValidated,
        );
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
