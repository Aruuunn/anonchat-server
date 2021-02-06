import { config } from 'dotenv';
import { MongooseModuleOptions } from '@nestjs/mongoose';
import { Modes } from '../common/enum/modes.enum';

config();

export const DEV_URI = process.env.DEV_URI;
export const TEST_URI = process.env.TEST_URI;
export const PRODUCTION_URI = process.env.PRODUCTION_URI;

function getConnectionURI(): string {
  switch (process.env.NODE_ENV) {
    case Modes.PRODUCTION:
      return PRODUCTION_URI;
    case Modes.DEVELOPMENT:
      return DEV_URI;
    case Modes.TESTING:
      return TEST_URI;
    default:
      throw new Error(`Unexpected NODE_ENV provided: ${process.env.NODE_ENV} `);
  }
}

export const CONNECTION_URI = getConnectionURI();

export const mongoConfig: MongooseModuleOptions = {
  useCreateIndex: true,
};
