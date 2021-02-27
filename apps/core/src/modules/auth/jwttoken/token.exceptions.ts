import { ErrorFactoryFactory } from '../../../common/error-factory-factory';

export enum TokenErrorsEnum {
  INVALID_JWT = 'INVALID_JWT',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
}

export const TokenErrorFactory = ErrorFactoryFactory<TokenErrorsEnum>();
