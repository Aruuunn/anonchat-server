import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import {
  ACCESS_TOKEN_EXPIRES_IN,
  ACCESS_TOKEN_SECRET,
} from '../config/jwt.config';
import { JwtStrategy } from './jwt-strategy';
import { AuthController } from './auth.controller';
import { RefreshTokenService } from './refresh-token.service';
import { AuthGuard } from './auth.guard';

@Module({
  imports: [
    JwtModule.register({
      secret: ACCESS_TOKEN_SECRET,
      signOptions: {
        expiresIn: ACCESS_TOKEN_EXPIRES_IN,
      },
    }),
    forwardRef(() => UserModule),
  ],
  providers: [AuthService, JwtStrategy, RefreshTokenService, AuthGuard],
  exports: [JwtModule, AuthService, JwtStrategy, RefreshTokenService],
  controllers: [AuthController],
})
export class AuthModule {}
