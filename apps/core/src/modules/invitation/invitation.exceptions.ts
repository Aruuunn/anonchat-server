import {ErrorFactoryFactory} from '../../common/error-factory-factory';

export enum InvitationErrorsEnum {
    INVITATION_NOT_FOUND = 'INVITATION_NOT_FOUND',
    ERROR_CREATING_INVITATION = 'ERROR_CREATING_INVITATION',
    FORBIDDEN_TO_OPEN_INVITATION = 'FORBIDDEN_TO_OPEN_INVITATION'
}

export const InvitationErrorFactory = ErrorFactoryFactory<InvitationErrorsEnum>();
