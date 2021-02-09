import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export interface Message {
  ciphertext: string;
  chatId: string;
}

@Schema()
export class MessageModel extends mongoose.Document implements Message {
  @Prop()
  ciphertext: string;

  @Prop()
  chatId: string;
}

export const MessageSchema = SchemaFactory.createForClass(MessageModel);
