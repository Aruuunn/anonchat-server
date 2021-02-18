import {MongooseModuleOptions} from '@nestjs/mongoose';

export const MONGO_URI = process.env.MONGO_URI;

if (typeof MONGO_URI !== 'string') {
    throw new Error('MongoDB connection URI is required!');
}


export const mongoConfig: MongooseModuleOptions = {
    useCreateIndex: true,
};
