import { UserModel } from '../../user/model/user.model';

export interface UserDataWithTokens {
  user: UserModel;
  accessToken: string;
  refreshToken: string;
}
