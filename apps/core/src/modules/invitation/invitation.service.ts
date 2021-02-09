import { Injectable } from '@nestjs/common';
import { InvitationModel } from './invitation.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserModel } from '../user/model/user.model';
import { InvitationNotFoundError } from './exceptions/invitation-not-found.error';
import { UserService } from '../user/user.service';
import { ChatService } from '../chat/chat.service';

@Injectable()
export class InvitationService {
  constructor(
    @InjectModel(InvitationModel.name)
    private invitationModel: Model<InvitationModel>,
    private userService: UserService,
    private chatService: ChatService,
  ) {}

  async fetchInvitationUsingId(id: string): Promise<InvitationModel> {
    return this.invitationModel.findOne({ id });
  }

  async newInvitation(from: UserModel): Promise<InvitationModel> {
    return this.invitationModel.create({ from });
  }

  async invitationOpened(
    openedBy: UserModel,
    invitationId: string,
  ): Promise<void> {
    const invitation = await this.invitationModel.findOne({ id: invitationId });

    if (!invitation) {
      throw new InvitationNotFoundError();
    }

    if (invitation.creatorOfInvitation.id === openedBy) {
      throw new Error('The Creator of Invitation Cannot Open the Invitation');
    }
    await this.chatService.startNewChat(invitation, openedBy);
  }
}
