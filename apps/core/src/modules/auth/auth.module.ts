import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { RefreshTokenService } from './jwttoken/refresh-token.service';
import { AuthGuard } from './gaurds/http/auth.guard';
import { WsGuard } from './gaurds/websocket/ws.guard';
import { AccessTokenService } from './jwttoken/access-token.service';
import { InvitationModule } from '../invitation/invitation.module';

@Module({
  imports: [forwardRef(() => UserModule), InvitationModule],
  providers: [
    AuthService,
    AccessTokenService,
    RefreshTokenService,
    AuthGuard,
    WsGuard,
  ],
  exports: [AuthService, AccessTokenService, RefreshTokenService, WsGuard],
  controllers: [AuthController],
})
export class AuthModule {}
