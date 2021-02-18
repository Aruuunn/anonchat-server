import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {AuthModule} from './auth/auth.module';
import {MONGO_URI, mongoConfig} from '../config';
import {UserModule} from './user/user.module';
import {ChatModule} from './chat/chat.module';
import {InvitationModule} from './invitation/invitation.module';

@Module({
    imports: [
        MongooseModule.forRoot(MONGO_URI, mongoConfig),
        AuthModule,
        UserModule,
        ChatModule,
        InvitationModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {
}
