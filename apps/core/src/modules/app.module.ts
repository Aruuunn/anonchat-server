import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { CONNECTION_URI, mongoConfig } from '../config/mongo.config';
import { UserModule } from './user/user.module';
import { MessageGateway } from '../common/gateways/message.gateway';

@Module({
  imports: [
    MongooseModule.forRoot(CONNECTION_URI, mongoConfig),
    AuthModule,
    UserModule,
  ],
  controllers: [],
  providers: [MessageGateway],
})
export class AppModule {}
