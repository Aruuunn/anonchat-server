import {
  BadRequestException,
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/gaurds/http/auth.guard';
import { UserService } from './user.service';
import { User } from './decorators/get-user.decorator';
import { DeviceType } from './interfaces/device-type.interface';
import { BundleNotFoundError } from './exceptions/bundle-not-found.error';
import { UserNotFoundError } from './exceptions/user-not-found.error';
import { isUUID } from '@nestjs/common/utils/is-uuid';

export async function httpHandleUserServiceThrownErrors<returnType>(
  fn: () => Promise<returnType>,
): Promise<returnType> {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof BundleNotFoundError || e instanceof UserNotFoundError) {
      throw new NotFoundException();
    } else {
      throw e;
    }
  }
}

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(AuthGuard)
  @Get(':userId/bundle')
  fetchBundle(
    @Param('userId') userId: string,
    @Param('registrationId', ParseIntPipe) registrationId: number,
    @User() user: any,
  ): Promise<DeviceType<string>> {
    if (!isUUID(userId)) {
      throw new BadRequestException();
    }
    if (user.id === userId) {
      throw new BadRequestException();
    }
    return httpHandleUserServiceThrownErrors<DeviceType<string>>(() => {
      return this.userService.fetchBundle(userId, user);
    });
  }
}
