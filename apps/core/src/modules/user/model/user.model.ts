import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { User } from '../interfaces/user.interface';
import { Bundle } from '../interfaces/bundle.interface';

@Schema()
export class UserModel extends Document implements User {
  @Prop({ auto: true })
  id: string;

  @Prop({ type: [Object] })
  bundle: Bundle<string>;
}

export const UserSchema = SchemaFactory.createForClass(UserModel);
