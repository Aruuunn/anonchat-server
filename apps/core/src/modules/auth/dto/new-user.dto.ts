import { IsNotEmpty, IsObject } from 'class-validator';
import { User } from '../../user/interfaces/user.interface';
import { BundleDto } from './bundle.dto';

export class NewUserDto implements Pick<User, 'bundle'> {
  @IsNotEmpty()
  @IsObject()
  bundle: BundleDto;
}
