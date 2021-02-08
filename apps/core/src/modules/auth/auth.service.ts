import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { RefreshTokenService } from './jwttoken/refresh-token.service';
import { AccessTokenService } from './jwttoken/access-token.service';
import { NewUserDto } from './dto/new-user.dto';
import { UserModel } from '../user/model/user.model';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private accessTokenService: AccessTokenService,
    private refreshTokenService: RefreshTokenService,
  ) {}

  async register(
    userData: NewUserDto,
  ): Promise<{ user: UserModel; accessToken: string; refreshToken: string }> {
    const newUser = await this.userService.createNewUser(userData);

    const accessToken = this.accessTokenService.generateTokenUsingId(
      newUser.id,
    );
    const refreshToken = this.refreshTokenService.generateTokenUsingId(
      newUser.id,
    );

    return { user: newUser, accessToken, refreshToken };
  }
}
