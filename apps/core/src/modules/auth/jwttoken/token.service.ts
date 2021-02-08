import { JwtPayload } from '../interfaces/jwt-payload.interface';
import * as jwt from 'jsonwebtoken';

export class TokenService {
  constructor(private TOKEN_SECRET: string, private TOKEN_EXPIRES_IN: string) {}

  generateTokenUsingId(id: string): string {
    const payload: JwtPayload = { id };
    return jwt.sign(payload, this.TOKEN_SECRET, {
      expiresIn: this.TOKEN_EXPIRES_IN,
    });
  }

  decode(token: string): JwtPayload {
    return jwt.decode(token) as JwtPayload;
  }

  verify(token: string): JwtPayload {
    return jwt.verify(token, this.TOKEN_SECRET) as JwtPayload;
  }
}
