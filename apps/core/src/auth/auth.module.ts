import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { RefreshTokenService } from './refresh-token.service';
import { AuthGuard } from './gaurds/http/auth.guard';
import { WsGuard } from './gaurds/websocket/ws.guard';
import { AccessTokenService } from './access-token.service';

@Module({
  imports: [forwardRef(() => UserModule)],
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
