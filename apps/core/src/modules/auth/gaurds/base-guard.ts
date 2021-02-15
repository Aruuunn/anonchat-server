import {ExecutionContext, Injectable} from '@nestjs/common';
import {AccessTokenService} from '../jwttoken/access-token.service';
import {RefreshTokenService} from '../jwttoken/refresh-token.service';
import {UserService} from '../../user/user.service';
import {JwtPayload} from '../interfaces/jwt-payload.interface';
import {UserModel} from '../../user/model/user.model';
import {isTruthy} from '../../../utils/is-truthy.util';
import {TokenExpiredError} from 'jsonwebtoken';

@Injectable()
export abstract class BaseGuard {
    protected constructor(
        public accessTokenService: AccessTokenService,
        public refreshTokenService: RefreshTokenService,
        public userService: UserService,
    ) {
    }

    protected abstract getRequest(context: ExecutionContext): any;

    protected abstract getRefreshToken(context: ExecutionContext): string | undefined;

    protected abstract getAccessToken(context: ExecutionContext): string | undefined;

    attachNewPropertyToRequest(
        propertyName: string,
        value: any,
        context: ExecutionContext,
    ): void {
        const request = this.getRequest(context);
        request[propertyName] = value;
    }

    private async validateToken(
        token: string,
        tokenValidator: (token: string) => JwtPayload | undefined,
        onValidated: (user: UserModel) => Promise<void>,
    ): Promise<boolean> {
        if (isTruthy(token)) {
            try {
                const {id} = tokenValidator(token);
                if (isTruthy(id)) {
                    const user = await this.userService.findUserUsingId(id);
                    if (isTruthy(user)) {
                        await onValidated(user);
                        return true;
                    }
                }
            } catch (e) {
                if (e instanceof TokenExpiredError) {
                    return false;
                } else {
                    throw e;
                }
            }

        }
        return false;
    }

    public async validateAccessToken(
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

    public async validateRefreshToken(
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

}
