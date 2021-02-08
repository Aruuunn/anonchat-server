import * as mongoose from 'mongoose';
import { UserModel } from '../user/model/user.model';
import { Prop, SchemaFactory } from '@nestjs/mongoose';

export class InvitationModel extends mongoose.Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: UserModel.name })
  from: UserModel;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: UserModel.name,
    required: false,
  })
  to?: UserModel;
}

export const InvitationSchema = SchemaFactory.createForClass(InvitationModel);
