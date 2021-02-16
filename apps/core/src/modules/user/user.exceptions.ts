import {ErrorFactoryFactory} from '../../common/error-factory-factory';

export enum UserErrorsEnum {
    ERROR_CREATING_USER = 'ERROR_CREATING_USER',
    USER_NOT_FOUND = 'USER_NOT_FOUND',
    ERROR_UPDATING_USER = 'ERROR_UPDATING_USER'
}


export const UserErrorFactory = ErrorFactoryFactory<UserErrorsEnum>();
