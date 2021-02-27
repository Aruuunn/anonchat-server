import { config } from 'dotenv';

//Load env variables from .env
config();

export * from './allowed-origins.config';
export * from './chat.config';
export * from './cookie.config';
export * from './jwt.config';
export * from './mongo.config';
