import { Injectable } from '@nestjs/common';
import {
  REFRESH_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_SECRET,
} from '../../../config/jwt.config';
import { TokenService } from './token.service';

@Injectable()
export class RefreshTokenService extends TokenService {
  protected TOKEN_EXPIRES_IN = REFRESH_TOKEN_SECRET;
  protected TOKEN_SECRET = REFRESH_TOKEN_EXPIRES_IN;
}
