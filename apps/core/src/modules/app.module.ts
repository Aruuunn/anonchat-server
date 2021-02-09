import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { CONNECTION_URI, mongoConfig } from '../config/mongo.config';
import { UserModule } from './user/user.module';
import { ChatModule } from './chat/chat.module';
import { InvitationModule } from './invitation/invitation.module';

@Module({
  imports: [
    MongooseModule.forRoot(CONNECTION_URI, mongoConfig),
    AuthModule,
    UserModule,
    ChatModule,
    InvitationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
