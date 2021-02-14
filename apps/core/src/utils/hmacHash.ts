import {createHmac} from 'crypto';
import {CHAT_HMAC_SECRET} from '../config/chat.config';


export const hmacHash = (value: string) => createHmac('sha1', CHAT_HMAC_SECRET).update(value).digest('base64');
