import { ExecutionContext } from '@nestjs/common';
import { Result } from 'neverthrow';
import { UserService } from '../../user/user.service';
import { AccessTokenService } from '../jwttoken/access-token.service';
import { RefreshTokenService } from '../jwttoken/refresh-token.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { UserDocument } from '../../user/model/user.model';
import { Failure } from '../../../common/failure.interface';
import { TokenErrorsEnum } from '../jwttoken/token.exceptions';

export abstract class BaseGuard {
  protected constructor(
    public accessTokenService: AccessTokenService,
    public refreshTokenService: RefreshTokenService,
    public userService: UserService,
  ) {}

  protected abstract getRequest(context: ExecutionContext): any;

  protected abstract getRefreshToken(
    context: ExecutionContext,
  ): Result<string, Failure<TokenErrorsEnum.INVALID_JWT>>;

  protected abstract getAccessToken(
    context: ExecutionContext,
  ): Result<string, Failure<TokenErrorsEnum.INVALID_JWT>>;

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
    tokenValidator: (token: string) => Result<JwtPayload, Failure<any>>,
    onValidated: (user: UserDocument) => Promise<void>,
  ): Promise<boolean> {
    const result = tokenValidator(token);
    if (result.isErr()) {
      return false;
    } else {
      const { id } = result.value;
      const userResult = await this.userService.findUserUsingId(id);
      if (userResult.isErr()) {
        return false;
      } else {
        await onValidated(userResult.value);
        return true;
      }
    }
  }

  public async validateAccessToken(
    context: ExecutionContext,
    onValidated: (user: UserDocument) => Promise<void>,
  ): Promise<boolean> {
    const accessTokenResult = this.getAccessToken(context);
    if (accessTokenResult.isErr()) {
      return false;
    }
    return this.validateToken(
      accessTokenResult.value,
      this.accessTokenService.verify.bind(this.accessTokenService),
      onValidated,
    );
  }

  public async validateRefreshToken(
    context: ExecutionContext,
    onValidated: (user: UserDocument) => Promise<void>,
  ): Promise<boolean> {
    const refreshTokenResult = this.getRefreshToken(context);
    if (refreshTokenResult.isErr()) {
      return false;
    }
    return this.validateToken(
      refreshTokenResult.value,
      this.refreshTokenService.verify.bind(this.refreshTokenService),
      onValidated,
    );
  }
}
