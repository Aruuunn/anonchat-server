import * as autoPopulate from 'mongoose-autopopulate';
import { Document, Model, Schema } from 'mongoose';

export const useFactoryFactory = <M extends Document>(
  schema: Schema<M, Model<M>>,
) => {
  return () => {
    schema.plugin(autoPopulate);
    return schema;
  };
};
