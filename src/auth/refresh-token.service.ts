import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { JwtPayload } from './jwt-payload';
import {
  REFRESH_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_SECRET,
} from '../config/jwt.config';

@Injectable()
export class RefreshTokenService {
  generateRefreshTokenUsingEmail(email: string): string {
    const payload: JwtPayload = { email };
    return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    });
  }

  verify(token: string): JwtPayload {
    return jwt.verify(token, REFRESH_TOKEN_SECRET) as JwtPayload;
  }
}
