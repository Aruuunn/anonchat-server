import { Injectable } from '@nestjs/common';
import { err, ok, Result } from 'neverthrow';
import { UserService } from '../user/user.service';
import { RefreshTokenService } from './jwttoken/refresh-token.service';
import { AccessTokenService } from './jwttoken/access-token.service';
import { NewUserDto } from './dto/new-user.dto';
import { UserDocument } from '../user/model/user.model';
import { Failure } from '../../common/failure.interface';
import { UserErrorsEnum } from '../user/user.exceptions';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private accessTokenService: AccessTokenService,
    private refreshTokenService: RefreshTokenService,
  ) {}

  async register(
    userData: NewUserDto,
  ): Promise<
    Result<
      { user: UserDocument; accessToken: string; refreshToken: string },
      Failure<UserErrorsEnum.ERROR_CREATING_USER>
    >
  > {
    const userResult = await this.userService.createNewUser(userData);
    if (userResult.isErr()) {
      return err(userResult.error);
    }

    const accessToken = this.accessTokenService.generateTokenUsingId(
      userResult.value.id,
    );
    const refreshToken = this.refreshTokenService.generateTokenUsingId(
      userResult.value.id,
    );

    return ok({ user: userResult.value, accessToken, refreshToken });
  }
}
