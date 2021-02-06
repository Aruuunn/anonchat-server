import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { NewUserDto } from './dto/new-user.dto';
import { compareSync, genSaltSync, hashSync } from 'bcrypt';
import { SignInPayload } from './interfaces/signin-payload.interface';
import { RefreshTokenService } from './jwttoken/refresh-token.service';
import { AccessTokenService } from './jwttoken/access-token.service';
import { UserDataWithTokens } from './interfaces/user-data-with-tokens.interface';
import { EmailOrPasswordWrongError } from './exceptions/email-password-wrong.error';

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
