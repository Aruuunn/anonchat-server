import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  InternalServerErrorException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/gaurds/http/auth.guard';
import { InvitationService } from './invitation.service';
import { User } from '../user/decorators/get-user.decorator';
import { UserDocument } from '../user/model/user.model';
import { UserService } from '../user/user.service';
import { hmacHash } from '../../utils/hmacHash';
import { InvitationErrorsEnum } from './invitation.exceptions';
import { ChatDocument } from '../chat/models/chat.model';
import { UserErrorsEnum } from '../user/user.exceptions';
import { ChatErrorsEnum } from '../chat/chat.exceptions';

@Controller({ path: 'invitation' })
export class InvitationController {
  constructor(
    private invitationService: InvitationService,
    private userService: UserService,
  ) {}

  @Get(':invitationId')
  @UseGuards(AuthGuard)
  async fetchDetails(
    @Param('invitationId') invitationId: string,
    @User() user: UserDocument,
  ): Promise<{ fullName: string }> {
    const invitationResult = await this.invitationService.fetchInvitationUsingId(
      invitationId,
    );

    if (invitationResult.isErr()) {
      if (
        invitationResult.error.type ===
        InvitationErrorsEnum.INVITATION_NOT_FOUND
      ) {
        throw new BadRequestException();
      }
      throw new InternalServerErrorException();
    }
    const invitation = invitationResult.value;

    if (invitation.creatorOfInvitation.id === user.id) {
      throw new BadRequestException();
    }
    return { fullName: invitation.creatorOfInvitation.fullName };
  }

  @Post(':invitationId/open')
  @UseGuards(AuthGuard)
  async openInvitation(
    @Param('invitationId')
    invitationId: string,
    @User() user: UserDocument,
  ) {
    const result = await this.invitationService.invitationOpened(
      user,
      invitationId,
    );
    if (result.isErr()) {
      switch (result.error.type) {
        case ChatErrorsEnum.CHAT_ALREADY_EXIST:
          throw new BadRequestException(
            'You have already accepted the invitation!',
          );
        case InvitationErrorsEnum.INVITATION_NOT_FOUND:
          throw new BadRequestException('Invitation not found');
        case InvitationErrorsEnum.FORBIDDEN_TO_OPEN_INVITATION:
          throw new ForbiddenException();
        default:
          throw new InternalServerErrorException();
      }
    }
    const chat: ChatDocument = result.value;

    const bundleResult = await this.userService.fetchBundle(
      chat.invitation.creatorOfInvitation,
    );
    if (bundleResult.isErr()) {
      switch (bundleResult.error.type) {
        case UserErrorsEnum.ERROR_UPDATING_USER:
        default:
          throw new InternalServerErrorException();
      }
    }
    const bundle = bundleResult.value;

    if (typeof chat?.invitation?.creatorOfInvitation?.id !== 'string') {
      throw new InternalServerErrorException();
    }

    const recipientId = hmacHash(chat.invitation.creatorOfInvitation.id);
    return { chatId: chat.id, bundle, recipientId };
  }
}
