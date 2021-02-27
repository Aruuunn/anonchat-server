import { JwtPayload } from '../interfaces/jwt-payload.interface';
import * as jwt from 'jsonwebtoken';
import { TokenExpiredError } from 'jsonwebtoken';
import { isValidJwt } from '../../../utils/is-valid-jwt';
import { err, ok, Result } from 'neverthrow';
import { TokenErrorFactory, TokenErrorsEnum } from './token.exceptions';
import { Failure } from '../../../common/failure.interface';

export class TokenService {
  constructor(
    private readonly TOKEN_SECRET: string,
    private readonly TOKEN_EXPIRES_IN: string,
  ) {
    this.TOKEN_EXPIRES_IN = this.TOKEN_EXPIRES_IN ?? '1h';
    if (this.TOKEN_SECRET.trim().length === 0) {
      throw new Error('Token Secret cannot be empty!');
    }
  }

  generateTokenUsingId(id: string): string {
    const payload: JwtPayload = { id };
    return jwt.sign(payload, this.TOKEN_SECRET, {
      expiresIn: this.TOKEN_EXPIRES_IN,
    });
  }

  decode(
    token: string,
  ): Result<JwtPayload, Failure<TokenErrorsEnum.INVALID_JWT>> {
    if (!isValidJwt(token)) {
      return err(TokenErrorFactory(TokenErrorsEnum.INVALID_JWT));
    }
    try {
      return ok(jwt.decode(token) as JwtPayload);
    } catch (e) {
      return err(TokenErrorFactory(TokenErrorsEnum.INVALID_JWT));
    }
  }

  verify(
    token: string,
  ): Result<
    JwtPayload,
    Failure<TokenErrorsEnum.INVALID_JWT | TokenErrorsEnum.TOKEN_EXPIRED>
  > {
    if (!isValidJwt(token)) {
      return err(TokenErrorFactory(TokenErrorsEnum.INVALID_JWT));
    }
    try {
      return ok(jwt.verify(token, this.TOKEN_SECRET) as JwtPayload);
    } catch (e) {
      if (e instanceof TokenExpiredError) {
        return err(TokenErrorFactory(TokenErrorsEnum.TOKEN_EXPIRED));
      }
      return err(TokenErrorFactory(TokenErrorsEnum.INVALID_JWT));
    }
  }
}
