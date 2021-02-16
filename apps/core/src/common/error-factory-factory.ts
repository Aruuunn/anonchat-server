import {Failure} from './failure.interface';

export function ErrorFactoryFactory<E>() {
    return function ErrorFactory<T extends E>(err: T, message?: string): Failure<T> {
        return ({
            type: err,
            message: message ?? ''
        });
    };
}
