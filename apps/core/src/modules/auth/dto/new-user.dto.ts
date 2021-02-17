import {IsNotEmpty, IsObject, IsString, MaxLength, MinLength} from 'class-validator';
import {UserInterface} from '../../user/interfaces/user.interface';
import {BundleDto} from './bundle.dto';

export class NewUserDto implements Pick<UserInterface, 'bundle'> {
    @IsNotEmpty()
    @IsObject()
    bundle: BundleDto;

    @IsNotEmpty()
    @IsString()
    @MaxLength(40)
    @MinLength(1)
    fullName: string;
}
