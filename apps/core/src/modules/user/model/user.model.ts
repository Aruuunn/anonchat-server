import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from '../interfaces/user.interface';
import { Bundle } from '../interfaces/bundle.interface';
import { MessageModel, MessageSchema } from '../../chat/models/message.model';

@Schema()
export class UserModel extends mongoose.Document implements User {
  @Prop({ type: [Object], required: true })
  bundle: Bundle<string>;

  // Not Optimal when ton messages are being sent
  // @TODO Change Structure to scale for lot of messages
  @Prop({ type: [MessageSchema], default: [] })
  notDeliveredMessages: MessageModel[];
}

export const UserSchema = SchemaFactory.createForClass(UserModel);
