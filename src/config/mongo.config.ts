import { config } from 'dotenv';
import { MongooseModuleOptions } from '@nestjs/mongoose';

config();

export const DEV_URI = process.env.DEV_URI;
export const TEST_URI = process.env.TEST_URI;
export const PRODUCTION_URI = process.env.PRODUCTION_URI;

function getConnectionURI(): string {
  switch (process.env.NODE_ENV || 'development') {
    case 'production':
      return PRODUCTION_URI;
    case 'development':
      return DEV_URI;
    case 'testing':
      return TEST_URI;
    default:
      throw new Error(`Unexpected NODE_ENV provided: ${process.env.NODE_ENV} `);
  }
}

export const CONNECTION_URI = getConnectionURI();

export const mongoConfig: MongooseModuleOptions = {
  useCreateIndex: true,
};
