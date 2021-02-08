import {Bundle} from './bundle.interface';

export interface User {
  id: string;
  bundle: Bundle<string>;
}
