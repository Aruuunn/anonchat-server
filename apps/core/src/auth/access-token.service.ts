import { TokenService } from './token.service';
import {
  ACCESS_TOKEN_EXPIRES_IN,
  ACCESS_TOKEN_SECRET,
} from '../config/jwt.config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AccessTokenService extends TokenService {
  protected TOKEN_SECRET = ACCESS_TOKEN_SECRET;
  protected TOKEN_EXPIRES_IN = ACCESS_TOKEN_EXPIRES_IN;
}
