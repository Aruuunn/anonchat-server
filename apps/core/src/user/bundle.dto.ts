import { Bundle, PreKeyType, SignedPublicPreKeyType } from './bundle.interface';
import { IsArray, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class PreKeyTypeDto implements PreKeyType<string> {
  @IsNotEmpty()
  @IsNumber()
  keyId: number;

  @IsNotEmpty()
  @IsString()
  publicKey: string;
}

export class SignedPublicPreKeyTypeDto
  implements SignedPublicPreKeyType<string> {
  @IsNotEmpty()
  @IsNumber()
  keyId: number;

  @IsNotEmpty()
  @IsString()
  publicKey: string;

  @IsNotEmpty()
  @IsString()
  signature: string;
}

export class BundleDto implements Bundle<string> {
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  registrationId: number;

  @IsNotEmpty()
  @IsString()
  identityPubKey: string;

  @IsNotEmpty()
  @IsArray()
  oneTimePreKeys: PreKeyTypeDto[];
  @IsNotEmpty()
  signedPreKey: SignedPublicPreKeyTypeDto;
}
