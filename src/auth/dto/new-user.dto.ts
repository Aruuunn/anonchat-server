import { User } from '../../user/user.interface';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class NewUserDto implements Omit<User, 'password' | 'salt'> {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @MinLength(2)
  name: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  password: string;
}
