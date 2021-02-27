import { Test } from '@nestjs/testing';
import { UserService } from './user.service';
import { getModelToken } from '@nestjs/mongoose';
import { UserDocument } from './model/user.model';
import { UserInterface } from './interfaces/user.interface';

function mockUser(userData: Partial<UserInterface> & { id?: string }) {
  return {
    bundle: userData.bundle ?? {
      registrationId: 103827,
      signedPreKey: {
        publicKey: 'publicKey',
        keyId: 1334,
        signature: 'signature',
      },
      oneTimePreKeys: [
        {
          keyId: 2398,
          publicKey: 'publicKey',
        },
      ],
      identityPubKey: 'identityPubKey',
    },
    notDeliveredMessages: userData.notDeliveredMessages ?? [],
    fullName: userData.fullName ?? 'Arun',
    id: userData.id ?? 'unique-id',
  };
}

describe('User Service', () => {
  let userService: UserService;
  const userModel: any = {};
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(UserDocument.name),
          useValue: userModel,
        },
      ],
    }).compile();
    userService = moduleRef.get<UserService>(UserService);
  });
  it('should update user', async () => {
    const user: any = mockUser({});

    user.save = (): Promise<UserDocument> => {
      return Promise.resolve(this);
    };

    const newFullName = 'Rose';

    const result1 = await userService.updateUser(user, (user) => ({
      ...user,
      fullName: newFullName,
    }));

    expect(result1.isOk()).toBe(true);
    if (result1.isOk()) {
      expect(result1.value?.fullName).toEqual(newFullName);
    }
  });
});
