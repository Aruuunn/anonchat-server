import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Res,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { AuthGuard } from '../auth/gaurds/http/auth.guard';
import { BundleDto } from './dto/bundle.dto';
import { UserService } from './user.service';
import { User } from './decorators/get-user.decorator';
import { UserModel } from './model/user.model';
import { Response } from 'express';
import { ObjectToArrayOnetimeprekeysPipe } from './pipes/object-to-array-onetimeprekeys.pipe';
import { DeviceType } from './interfaces/device-type.interface';
import { BundleNotFoundError } from './exceptions/bundle-not-found.error';
import { UserNotFoundError } from './exceptions/user-not-found.error';

async function httpHandleUserServiceThrownErrors<returnType>(
  fn: () => Promise<returnType>,
): Promise<returnType> {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof BundleNotFoundError || e instanceof UserNotFoundError) {
      throw new NotFoundException();
    } else {
      throw new InternalServerErrorException();
    }
  }
}

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('bundle')
  @UseGuards(AuthGuard)
  @UsePipes(ObjectToArrayOnetimeprekeysPipe)
  async postBundle(
    @Body() bundleData: BundleDto,
    @User() user: UserModel,
    @Res() res: Response,
  ): Promise<void> {
    await httpHandleUserServiceThrownErrors<void>(async () => {
      await this.userService.saveBundle(bundleData, user);
    });

    res.sendStatus(HttpStatus.OK);
  }

  @UseGuards(AuthGuard)
  @Get(':userId/bundle/:registrationId')
  fetchBundle(
    @Param('userId') userId: string,
    @Param('registrationId', ParseIntPipe) registrationId: number,
    @User() user: any,
  ): Promise<DeviceType<string>> {
    if (user.id === userId) {
      throw new BadRequestException();
    }
    return httpHandleUserServiceThrownErrors<DeviceType<string>>(() => {
      return this.userService.fetchBundle(userId, registrationId, user);
    });
  }
}
