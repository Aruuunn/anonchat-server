import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { User } from './user.interface';
import { Bundle } from './bundle.interface';
import { BundleDto } from './bundle.dto';

export type UserDocument = UserModel & Document;

@Schema()
export class UserModel implements User {
  @Prop()
  name: string;

  @Prop({ unique: true, required: true, index: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  salt: string;

  @Prop({ type: BundleDto })
  bundle: Bundle<string>;
}

export const UserSchema = SchemaFactory.createForClass(UserModel);
