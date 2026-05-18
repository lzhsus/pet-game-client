import { Http } from '../core/Http';
import { UserManager } from './UserManager';

export interface RewardResult {
  received: boolean;
  message: string;
  coin: number;
  diamond: number;
  week?: WeekSignResult;
}

export interface WeekSignDay {
  date: string;
  day_no: number;
  label: string;
  signed: boolean;
  is_today: boolean;
  is_future: boolean;
  reward_coin: number;
  reward_diamond: number;
}

export interface WeekSignResult {
  today: string;
  week_start_date: string;
  week_end_date: string;
  today_signed: boolean;
  week: WeekSignDay[];
}

export class RewardManager {
  public static weekSign: WeekSignResult | null = null;

  static async dailySign(): Promise<RewardResult> {
    const res = await Http.post<{
      reward: RewardResult;
      user?: any;
    }>('/api/reward/sign');

    if (res.code !== 0) {
      throw new Error(res.message || '签到失败');
    }

    if (res.data.reward?.week) {
      RewardManager.weekSign = res.data.reward.week;
    }

    if (res.data.user) {
      UserManager.updateUser(res.data.user);
    } else {
      await UserManager.getInfo();
    }

    return res.data.reward;
  }

  static async getWeekSign(): Promise<WeekSignResult> {
    const res = await Http.get<{
      week: WeekSignResult;
    }>('/api/reward/sign/week');

    if (res.code !== 0) {
      throw new Error(res.message || '获取签到状态失败');
    }

    RewardManager.weekSign = res.data.week;
    return RewardManager.weekSign;
  }
}
