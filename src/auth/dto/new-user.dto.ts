import { User } from '../../user/user.interface';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { SignInPayload } from '../signin-payload.interface';

export class NewUserDto
  extends SignInPayload
  implements Omit<User, 'password' | 'salt'> {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @MinLength(2)
  name: string;
}
