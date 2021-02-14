import {forwardRef, Module} from '@nestjs/common';
import {ChatService} from './chat.service';
import {ChatGateway} from './chat.gateway';
import {AuthModule} from '../auth/auth.module';
import {MongooseModule} from '@nestjs/mongoose';
import {ChatModel, ChatSchema} from './models/chat.model';
import {useFactoryFactory} from '../../common/use-factory-autopopulate.mongoose';
import {UserModule} from '../user/user.module';
import {MessageModel, MessageSchema} from './models/message.model';

@Module({
    imports: [
        MongooseModule.forFeatureAsync([
            {
                name: ChatModel.name,
                useFactory: useFactoryFactory(ChatSchema),
            },
            {
                name: MessageModel.name,
                useFactory: useFactoryFactory(MessageSchema),
            },
        ]),
        forwardRef(() => AuthModule),
        UserModule,
    ],
    providers: [ChatService, ChatGateway],
    exports: [ChatService, ChatGateway],
})
export class ChatModule {
}
