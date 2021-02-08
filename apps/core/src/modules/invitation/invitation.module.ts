import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import * as autoPopulate from 'mongoose-autopopulate';
import { InvitationModel, InvitationSchema } from './invitation.model';
import { InvitationService } from './invitation.service';
import { InvitationController } from './invitation.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: InvitationModel.name,
        useFactory: () => {
          const schema = InvitationSchema;
          schema.plugin(autoPopulate);
          return schema;
        },
      },
    ]),
    AuthModule,
  ],
  providers: [InvitationService],
  exports: [InvitationService],
  controllers: [InvitationController],
})
export class InvitationModule {}
