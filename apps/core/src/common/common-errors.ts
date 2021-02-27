import { ErrorFactoryFactory } from './error-factory-factory';

export enum CommonErrorsEnum {
  FORBIDDEN = 'FORBIDDEN',
}

export const CommonErrorFactory = ErrorFactoryFactory<CommonErrorsEnum>();
