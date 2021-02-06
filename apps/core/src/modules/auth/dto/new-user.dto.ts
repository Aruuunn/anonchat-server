import { User } from '../../user/interfaces/user.interface';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { SignInPayload } from '../interfaces/signin-payload.interface';

export class NewUserDto
  extends SignInPayload
  implements Omit<User, 'password' | 'salt'> {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @MinLength(2)
  name: string;
}
