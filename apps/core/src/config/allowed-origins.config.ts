import {Modes} from '../common/enum/modes.enum';

function getAllowedOrigins() {
    switch (process.env.NODE_ENV) {
        case Modes.DEVELOPMENT:
        case Modes.TESTING:
            return ['http://localhost:4200'];
        case Modes.PRODUCTION:
            return [process.env.PRODUCTION_CLIENT_BASE_URL];
        default:
            throw new Error('Unexpected NODE_ENV');
    }
}

export const ALLOWED_ORIGINS = getAllowedOrigins();

export default ALLOWED_ORIGINS;
