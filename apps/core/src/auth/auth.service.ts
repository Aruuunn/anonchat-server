import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { NewUserDto } from './dto/new-user.dto';
import { compareSync, genSaltSync, hashSync } from 'bcrypt';
import { SignInPayload } from './signin-payload.interface';
import { RefreshTokenService } from './refresh-token.service';
import { UserModel } from '../user/user.model';
import { AccessTokenService } from './access-token.service';

export interface UserDataWithTokens {
  user: UserModel;
  accessToken: string;
  refreshToken: string;
}

export class EmailOrPasswordWrongError extends Error {}

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private accessTokenService: AccessTokenService,
    private refreshTokenService: RefreshTokenService,
  ) {}

  async signUp(userData: NewUserDto): Promise<UserDataWithTokens> {
    const salt = genSaltSync(10);
    const newUser = await this.userService.createNewUser({
      ...userData,
      salt,
      password: hashSync(userData.password, salt),
    });

    const accessToken = this.accessTokenService.generateTokenUsingEmail(
      newUser.email,
    );
    const refreshToken = this.refreshTokenService.generateTokenUsingEmail(
      newUser.email,
    );

    return { user: newUser, accessToken, refreshToken };
  }

  async signIn(signInPayload: SignInPayload): Promise<UserDataWithTokens> {
    const { email, password } = signInPayload;
    const user = await this.userService.findUserUsingEmail(email);

    if (!user || !compareSync(password, user?.password)) {
      throw new EmailOrPasswordWrongError('Email/Password is wrong');
    }

    const accessToken = this.accessTokenService.generateTokenUsingEmail(
      user.email,
    );
    const refreshToken = this.refreshTokenService.generateTokenUsingEmail(
      user.email,
    );
    return { user, accessToken, refreshToken };
  }
}
