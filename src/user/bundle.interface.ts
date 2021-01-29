export interface PreKeyType<T = ArrayBuffer> {
  keyId: number;
  publicKey: T;
}

export interface SignedPublicPreKeyType<T = ArrayBuffer> extends PreKeyType<T> {
  signature: T;
}

export interface Bundle<T = ArrayBuffer> {
  registrationId: number;
  identityPubKey: T;
  signedPreKey: SignedPublicPreKeyType<T>;
  oneTimePreKeys: PreKeyType<T>[];
}
