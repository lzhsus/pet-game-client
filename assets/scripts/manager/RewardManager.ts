import { Http } from '../core/Http';
import { UserManager } from './UserManager';

export interface RewardResult {
  received: boolean;
  message: string;
  coin: number;
  diamond: number;
}

export class RewardManager {
  static async dailySign(): Promise<RewardResult> {
    const res = await Http.post<{
      reward: RewardResult;
      user?: any;
    }>('/api/reward/sign');

    if (res.code !== 0) {
      throw new Error(res.message || '签到失败');
    }

    if (res.data.user) {
      UserManager.updateUser(res.data.user);
    } else {
      await UserManager.getInfo();
    }

    return res.data.reward;
  }
}
