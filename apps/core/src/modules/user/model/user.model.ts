import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { User } from '../interfaces/user.interface';
import { Bundle } from '../interfaces/bundle.interface';
import { BundleDto } from '../dto/bundle.dto';

@Schema()
export class UserModel extends Document implements User {
  @Prop()
  name: string;

  @Prop({ unique: true, required: true, index: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  salt: string;

  @Prop({ type: [BundleDto] })
  bundles: Bundle<string>[];
}

export const UserSchema = SchemaFactory.createForClass(UserModel);
