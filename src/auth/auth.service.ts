import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { NewUserDto } from './dto/new-user.dto';
import { compareSync, genSaltSync, hashSync } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt-payload';
import { SignInPayload } from './signin-payload.interface';
import { RefreshTokenService } from './refresh-token.service';
import { UserDocument } from '../user/user.model';

export interface UserDataWithTokens {
  user: UserDocument;
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private refreshTokenService: RefreshTokenService,
  ) {}

  private generateAccessTokenUsingEmail(email: string): string {
    const payload: JwtPayload = { email };
    return this.jwtService.sign(payload);
  }

  getJwtPayloadFromToken(token: string): JwtPayload {
    return this.jwtService.decode(token) as JwtPayload;
  }

  generateAccessTokenUsingRefreshToken(refreshToken: string): string {
    const { email } = this.refreshTokenService.verify(refreshToken);
    return this.generateAccessTokenUsingEmail(email);
  }

  async signUp(userData: NewUserDto): Promise<UserDataWithTokens> {
    const salt = genSaltSync(10);
    const newUser = await this.userService.createNewUser({
      ...userData,
      salt,
      password: hashSync(userData.password, salt),
    });

    const accessToken = this.generateAccessTokenUsingEmail(newUser.email);
    const refreshToken = this.refreshTokenService.generateRefreshTokenUsingEmail(
      newUser.email,
    );

    return { user: newUser, accessToken, refreshToken };
  }

  async signIn(signInPayload: SignInPayload): Promise<UserDataWithTokens> {
    const { email, password } = signInPayload;
    const user = await this.userService.findUserUsingEmail(email);

    if (!user || !compareSync(password, user?.password)) {
      throw new BadRequestException('Email/Password is wrong');
    }

    const accessToken = this.generateAccessTokenUsingEmail(user.email);
    const refreshToken = this.refreshTokenService.generateRefreshTokenUsingEmail(
      user.email,
    );
    return { user, accessToken, refreshToken };
  }
}
