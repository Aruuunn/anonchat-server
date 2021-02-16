import {err, ok, Result} from 'neverthrow';
import {Failure} from '../common/failure.interface';
import {TokenErrorFactory, TokenErrorsEnum} from '../modules/auth/jwttoken/token.exceptions';

export const isValidJwt = (token: any): boolean => {
    const exp = /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/;
    return typeof token === 'string' && exp.test(token);
};


export const validateJwt = (token: string): Result<string, Failure<any>> => {
    if (isValidJwt(token)) {
        return ok(token);
    } else {
        return err(TokenErrorFactory(TokenErrorsEnum.INVALID_JWT));
    }
};
