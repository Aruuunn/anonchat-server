import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { BundleDto } from './bundle.dto';
import { UserService } from './user.service';
import { User } from './get-user.decorator';
import { UserDocument } from './user.model';
import { Response } from 'express';
import { Bundle } from './bundle.interface';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('bundle')
  @UseGuards(AuthGuard)
  @UsePipes(ValidationPipe)
  async postBundle(
    @Body() bundleData: BundleDto,
    @User() user: UserDocument,
    @Res() res: Response,
  ): Promise<void> {
    await this.userService.saveBundle(bundleData, user);
    res.sendStatus(HttpStatus.OK);
  }

  @Get('bundle/:id')
  fetchBundle(@Param('id') userId: string): Promise<Bundle<string>> {
    return this.userService.fetchBundle(userId);
  }
}
