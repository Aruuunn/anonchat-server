import {Injectable} from '@nestjs/common';
import {InvitationModel} from './invitation.model';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {UserModel} from '../user/model/user.model';
import {InvitationNotFoundError} from './exceptions/invitation-not-found.error';
import {UserService} from '../user/user.service';
import {ChatService} from '../chat/chat.service';
import {ChatModel} from '../chat/models/chat.model';
import {isTruthy} from '../../utils/is-truthy.util';

@Injectable()
export class InvitationService {
    constructor(
        @InjectModel(InvitationModel.name)
        private invitationModel: Model<InvitationModel>,
        private userService: UserService,
        private chatService: ChatService,
    ) {
    }

    async fetchInvitationUsingId(id: string): Promise<InvitationModel> {
        return this.invitationModel.findOne({_id: id});
    }

    async newInvitation(creatorOfInvitation: UserModel): Promise<InvitationModel> {
        return this.invitationModel.create({creatorOfInvitation});
    }

    async invitationOpened(
        openedBy: UserModel,
        invitationId: string,
    ): Promise<ChatModel> {
        const invitation = await this.invitationModel.findOne({_id: invitationId});

        if (!isTruthy(invitation)) {
            throw new InvitationNotFoundError();
        }

        if (invitation.creatorOfInvitation.id === openedBy.id) {
            throw new Error('The Creator of Invitation Cannot Open the Invitation');
        }
        return await this.chatService.startNewChat(invitation, openedBy);
    }
}
