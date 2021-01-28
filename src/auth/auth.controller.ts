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
import { SignInPayload } from './signin-payload.interface';
import { AuthService } from './auth.service';
import { NewUserDto } from './dto/new-user.dto';
import { UserDocument } from '../user/user.model';
import { User } from '../user/user.interface';
import { AuthGuard } from './auth.guard';

function getUserData(
  user: UserDocument,
): Omit<User, 'password' | 'salt'> & { _id: string } {
  const { email, name } = user;
  return { _id: user._id, name, email };
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
    const { user, accessToken, refreshToken } = await this.authService.signIn(
      payload,
    );

    res.cookie('refreshToken', refreshToken);
    res.send({ user: getUserData(user), accessToken });
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
      res.cookie('refreshToken', refreshToken);
      res.send({ user: getUserData(user), accessToken });
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
