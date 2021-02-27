import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { InvitationDocument } from '../../invitation/invitation.model';
import { UserDocument } from '../../user/model/user.model';

@Schema()
export class ChatDocument extends mongoose.Document {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: InvitationDocument.name,
    autopopulate: true,
  })
  invitation: InvitationDocument;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: UserDocument.name,
    autopopulate: true,
  })
  invitationAcceptedUser: UserDocument;
}

export const ChatSchema = SchemaFactory.createForClass(ChatDocument);
