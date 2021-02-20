import {ErrorFactoryFactory} from '../../common/error-factory-factory';

export enum ChatErrorsEnum {
    ERROR_CREATING_CHAT = 'ERROR_CREATING_CHAT',
    CHAT_NOT_FOUND = 'CHAT_NOT_FOUND',
    ERROR_CREATING_MESSAGE = 'ERROR_CREATING_MESSAGE',
    CHAT_ALREADY_EXIST = 'CHAT_ALREADY_EXIST'
}


export const ChatErrorFactory = ErrorFactoryFactory<ChatErrorsEnum>();
