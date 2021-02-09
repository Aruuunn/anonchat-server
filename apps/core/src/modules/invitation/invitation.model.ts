import * as mongoose from 'mongoose';
import { UserModel } from '../user/model/user.model';
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class InvitationModel extends mongoose.Document {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: UserModel.name,
    required: true,
  })
  creatorOfInvitation: UserModel;
}

export const InvitationSchema = SchemaFactory.createForClass(InvitationModel);
