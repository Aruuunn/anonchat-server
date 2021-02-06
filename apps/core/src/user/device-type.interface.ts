import { PreKeyType, SignedPublicPreKeyType } from './bundle.interface';

export interface DeviceType<T = ArrayBuffer> {
  identityKey: T;
  signedPreKey: SignedPublicPreKeyType<T>;
  preKey?: PreKeyType<T>;
  registrationId: number;
}
