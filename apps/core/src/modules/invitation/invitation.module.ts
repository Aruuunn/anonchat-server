import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InvitationModel, InvitationSchema } from './invitation.model';
import { InvitationService } from './invitation.service';
import { InvitationController } from './invitation.controller';
import { AuthModule } from '../auth/auth.module';
import { ChatModule } from '../chat/chat.module';
import { useFactoryFactory } from '../../common/use-factory-autopopulate.mongoose';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: InvitationModel.name,
        useFactory: useFactoryFactory(InvitationSchema),
      },
    ]),
    AuthModule,
    ChatModule,
    UserModule,
  ],
  providers: [InvitationService],
  exports: [InvitationService],
  controllers: [InvitationController],
})
export class InvitationModule {}
