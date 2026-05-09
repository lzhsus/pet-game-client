import { Http } from '../core/Http';

export interface BagItemModel {
  id: number;
  user_id: number;
  item_id: number;
  item_name: string;
  item_type: string;
  item_count: number;
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
