import { ApiConfig } from '../core/ApiConfig';
import { Http } from '../core/Http';
import { UserModel } from '../model/UserModel';

export class UserManager {
  static user: UserModel | null = null;

  static async login(): Promise<UserModel> {
    const res = await Http.post<{
      token: string;
      user: UserModel;
    }>('/api/login');

    if (res.code !== 0) {
      throw new Error(res.message || '登录失败');
    }

    ApiConfig.token = res.data.token;
    this.user = res.data.user;

    return this.user;
  }

  static async getInfo(): Promise<UserModel> {
    const res = await Http.get<{
      user: UserModel;
    }>('/api/user/info');

    if (res.code !== 0) {
      throw new Error(res.message || '获取用户失败');
    }

    this.user = res.data.user;

    return this.user;
  }

  static updateUser(user: UserModel): void {
    this.user = user;
  }
}
