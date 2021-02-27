import { config } from 'dotenv';

config();

export const CHAT_HMAC_SECRET = process.env.CHAT_HMAC_SECRET;

if (typeof CHAT_HMAC_SECRET === 'undefined') {
  throw new Error(
    "Hmac secret shouldn't be Undefined. set up value for environment variable CHAT_HMAC_SECRET",
  );
}
