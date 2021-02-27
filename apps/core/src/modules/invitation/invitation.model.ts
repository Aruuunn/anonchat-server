import * as mongoose from 'mongoose';
import { UserDocument } from '../user/model/user.model';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class InvitationDocument extends mongoose.Document {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: UserDocument.name,
    required: true,
    unique: true,
    autopopulate: true,
  })
  creatorOfInvitation: UserDocument;
}

export const InvitationSchema = SchemaFactory.createForClass(
  InvitationDocument,
);
