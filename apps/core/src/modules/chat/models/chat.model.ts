import * as mongoose from 'mongoose';
import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {InvitationModel} from '../../invitation/invitation.model';
import {UserModel} from '../../user/model/user.model';

@Schema()
export class ChatModel extends mongoose.Document {
    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: InvitationModel.name,
        autopopulate: true
    })
    invitation: InvitationModel;

    @Prop({type: mongoose.Schema.Types.ObjectId, ref: UserModel.name, autopopulate: true})
    invitationAcceptedUser: UserModel;

    get creatorOfInvitation(): UserModel {
        return this.invitation.creatorOfInvitation;
    }
}

export const ChatSchema = SchemaFactory.createForClass(ChatModel);
