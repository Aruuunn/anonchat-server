import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Post,
  Res,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { SignInPayload } from './interfaces/signin-payload.interface';
import { AuthService } from './auth.service';
import { NewUserDto } from './dto/new-user.dto';
import { UserModel } from '../user/model/user.model';
import { User } from '../user/interfaces/user.interface';
import { AuthGuard } from './gaurds/http/auth.guard';
import { cookieOptions } from '../../config/cookie.config';
import { EmailOrPasswordWrongError } from './exceptions/email-password-wrong.error';

function filterPropertiesOfUser(
  user: UserModel,
): Omit<User, 'password' | 'salt' | 'bundles'> & { id: string } {
  const { email, name } = user;
  return { id: user.id, name, email };
}

function setCookie(res: Response, data: Record<string, string>): void {
  for (const key of Object.keys(data)) {
    res.cookie(key, data[key], cookieOptions);
  }
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('test')
  @UseGuards(AuthGuard)
  test() {
    return 'Hey';
  }

  @Post('sign-in')
  @UsePipes(ValidationPipe)
  async signIn(
    @Body() payload: SignInPayload,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const { user, accessToken, refreshToken } = await this.authService.signIn(
        payload,
      );
      setCookie(res, { refreshToken });
      res.send({ data: { user: filterPropertiesOfUser(user) }, accessToken });
    } catch (e) {
      if (e instanceof EmailOrPasswordWrongError) {
        throw new BadRequestException();
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  @Post('sign-up')
  @UsePipes(ValidationPipe)
  async signUp(
    @Body() payload: NewUserDto,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const { user, accessToken, refreshToken } = await this.authService.signUp(
        payload,
      );
      setCookie(res, { refreshToken });
      res.send({ data: { user: filterPropertiesOfUser(user) }, accessToken });
    } catch (e) {
      if (e?.code === 11000) {
        throw new BadRequestException(
          'Account with the given Email Already Exist. Try Sign-in',
        );
      } else {
        throw new InternalServerErrorException();
      }
    }
  }
}
