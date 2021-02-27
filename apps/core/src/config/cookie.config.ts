import { Modes } from '../common/enum/modes.enum';
import { CookieSerializeOptions } from 'fastify-cookie';

export const cookieOptions: CookieSerializeOptions = {
  httpOnly: true,
  expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  secure: process.env.NODE_ENV === Modes.PRODUCTION,
  signed: false,
  path: '/',
  sameSite: 'strict',
};
