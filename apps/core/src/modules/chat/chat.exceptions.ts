import {ErrorFactoryFactory} from '../../common/error-factory-factory';

export enum ChatErrorsEnum {
    ERROR_CREATING_CHAT = 'ERROR_CREATING_CHAT',
    CHAT_NOT_FOUND = 'CHAT_NOT_FOUND',
    FORBIDDEN_TO_FETCH_BUNDLE = 'FORBIDDEN_TO_FETCH_BUNDLE',
    ERROR_CREATING_MESSAGE = 'ERROR_CREATING_MESSAGE',
    FORBIDDEN_TO_FETCH_RECIPIENT_ID = 'FORBIDDEN_TO_FETCH_RECIPIENT_ID'
}


export const ChatErrorFactory = ErrorFactoryFactory<ChatErrorsEnum>();
