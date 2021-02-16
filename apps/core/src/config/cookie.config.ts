import {Modes} from '../common/enum/modes.enum';

export const COOKIE_SECRET = process.env.COOKIE_SECRET;
export const cookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    secure: process.env.NODE_ENV === Modes.PRODUCTION,
    signed: true
};

if (typeof COOKIE_SECRET === 'undefined') {
    throw new Error('Cookie Secret is Required!');
}
