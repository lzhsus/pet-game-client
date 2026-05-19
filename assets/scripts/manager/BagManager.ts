import { Http } from '../core/Http';

export interface BagItemModel {
  id: number;
  user_id: number;
  item_id: number;
  item_name: string;
  item_type: 'food' | 'clean' | 'toy' | string;
  item_count: number;
  hunger_value: number;
  clean_value: number;
  mood_value: number;
  exp_value: number;
}

export class BagManager {
  static items: BagItemModel[] = [];

  static async list(): Promise<BagItemModel[]> {
    const res = await Http.get<{
      items: BagItemModel[];
    }>('/api/bag/list');

    if (res.code !== 0) {
      throw new Error(res.message || '获取背包失败');
    }

    this.items = res.data.items || [];
    return this.items;
  }
}
