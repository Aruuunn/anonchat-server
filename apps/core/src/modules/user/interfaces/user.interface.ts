import { Bundle } from './bundle.interface';
import { MessageInterface } from '../../chat/models/message.model';

export interface UserInterface {
  bundle: Bundle<string>;
  fullName: string;
  notDeliveredMessages: MessageInterface[];
}
