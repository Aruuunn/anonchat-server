import { TokenService } from './token.service';
import { ACCESS_TOKEN_EXPIRES_IN, ACCESS_TOKEN_SECRET } from '../../../config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AccessTokenService extends TokenService {
  constructor() {
    super(ACCESS_TOKEN_SECRET, ACCESS_TOKEN_EXPIRES_IN);
  }
}
