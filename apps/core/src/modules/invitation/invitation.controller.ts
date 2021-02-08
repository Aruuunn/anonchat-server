import {
  BadRequestException,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { InvitationModel } from './invitation.model';
import { AuthGuard } from '../auth/gaurds/http/auth.guard';
import { InvitationService } from './invitation.service';
import { User } from '../user/decorators/get-user.decorator';
import { UserModel } from '../user/model/user.model';
import { isUUID } from '@nestjs/common/utils/is-uuid';
import { InvitationNotFoundError } from './exceptions/invitation-not-found.error';
import { DeviceType } from '../user/interfaces/device-type.interface';

@Controller({ path: 'invitation' })
export class InvitationController {
  constructor(private invitationService: InvitationService) {}

  @Post()
  @UseGuards(AuthGuard)
  newInvitation(@User() user: UserModel): Promise<InvitationModel> {
    return this.invitationService.newInvitation(user);
  }

  @Get(':invitationId/bundle')
  @UseGuards(AuthGuard)
  async fetchBundle(
    @User() user: UserModel,
    @Param('invitationId') invitationId: string,
  ): Promise<DeviceType<string>> {
    if (!isUUID(invitationId)) {
      throw new BadRequestException('Invitation Id is not valid');
    }
    return await this.invitationService.fetchBundleUsingInvitationId(
      invitationId,
      user,
    );
  }

  @Post(':invitationId/open')
  @UseGuards(AuthGuard)
  async openInvitation(
    @Param('invitationId')
    invitationId: string,
    @User() user: UserModel,
  ): Promise<void> {
    if (!isUUID(invitationId)) {
      throw new BadRequestException('Invitation Id is not valid');
    }
    try {
      await this.invitationService.invitationOpened(user, invitationId);
    } catch (e) {
      if (e instanceof InvitationNotFoundError) {
        throw new BadRequestException('Invitation Not found');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }
}
