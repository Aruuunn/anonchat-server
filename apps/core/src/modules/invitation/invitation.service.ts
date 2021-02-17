import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {err, ok, Result} from 'neverthrow';
import {InvitationDocument} from './invitation.model';
import {UserDocument} from '../user/model/user.model';
import {UserService} from '../user/user.service';
import {ChatService} from '../chat/chat.service';
import {ChatDocument} from '../chat/models/chat.model';
import {isTruthy} from '../../utils/is-truthy.util';
import {InvitationErrorFactory, InvitationErrorsEnum} from './invitation.exceptions';
import {Failure} from '../../common/failure.interface';
import {ChatErrorsEnum} from '../chat/chat.exceptions';

@Injectable()
export class InvitationService {
    constructor(
        @InjectModel(InvitationDocument.name)
        private invitationModel: Model<InvitationDocument>,
        private userService: UserService,
        private chatService: ChatService,
    ) {
    }

    async fetchInvitationUsingId(
        id: string,
    ): Promise<Result<InvitationDocument, Failure<InvitationErrorsEnum.INVITATION_NOT_FOUND>>> {
        const invitation: InvitationDocument | undefined = await this.invitationModel.findOne({_id: id});
        if (isTruthy(invitation)) {
            return ok(invitation);
        } else {
            return err(InvitationErrorFactory(InvitationErrorsEnum.INVITATION_NOT_FOUND));
        }
    }

    async newInvitation(
        creatorOfInvitation: UserDocument,
    ): Promise<Result<InvitationDocument, Failure<InvitationErrorsEnum.ERROR_CREATING_INVITATION>>> {
        try {
            const invitation: InvitationDocument = await this.invitationModel.create({creatorOfInvitation});
            return ok(invitation);
        } catch (e) {
            return err(InvitationErrorFactory(InvitationErrorsEnum.ERROR_CREATING_INVITATION));
        }
    }

    async invitationOpened(
        openedBy: UserDocument,
        invitationId: string,
    ): Promise<Result<ChatDocument, Failure<InvitationErrorsEnum.INVITATION_NOT_FOUND | InvitationErrorsEnum.FORBIDDEN_TO_OPEN_INVITATION | ChatErrorsEnum.ERROR_CREATING_CHAT>>> {
        const invitationResult = await this.fetchInvitationUsingId(invitationId);

        if (invitationResult.isErr()) {
            return err(invitationResult.error);
        }
        const invitation = invitationResult.value;
        if (invitation.creatorOfInvitation.id === openedBy.id) {
            return err(InvitationErrorFactory(InvitationErrorsEnum.FORBIDDEN_TO_OPEN_INVITATION));
        }
        const chatCreationResult = await this.chatService.startNewChat(invitation, openedBy);

        if (chatCreationResult.isErr()) {
            return err(chatCreationResult.error);
        }

        const chat = chatCreationResult.value;
        return ok(chat);
    }
}
