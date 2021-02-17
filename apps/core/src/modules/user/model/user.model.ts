import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import {UserInterface} from '../interfaces/user.interface';
import {Bundle} from '../interfaces/bundle.interface';
import {MessageDocument, MessageSchema} from '../../chat/models/message.model';

@Schema()
export class UserDocument extends mongoose.Document implements UserInterface {
    @Prop({type: Object, required: true})
    bundle: Bundle<string>;

    @Prop({required: true})
    fullName: string;

    // Not Optimal when ton messages are being sent
    // @TODO Change Structure to scale for lot of messages
    @Prop({type: [MessageSchema], default: []})
    notDeliveredMessages: MessageDocument[];
}

export const UserSchema = SchemaFactory.createForClass(UserDocument);
