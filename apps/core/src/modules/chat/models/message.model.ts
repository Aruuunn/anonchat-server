import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export interface MessageType {
  type: number;
  body?: string;
  registrationId: number;
}

export interface MessageInterface {
  message: MessageType;
  chatId: string;
}

@Schema()
export class MessageDocument
  extends mongoose.Document
  implements MessageInterface {
  @Prop({ type: Object })
  message: MessageType;

  @Prop()
  chatId: string;
}

export const MessageSchema = SchemaFactory.createForClass(MessageDocument);
