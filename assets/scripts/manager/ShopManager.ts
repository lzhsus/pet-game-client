import { Http } from '../core/Http';
import { UserManager } from './UserManager';
import { BagManager } from './BagManager';

export interface GoodsModel {
  id: number;
  goods_name: string;
  goods_type: 'food' | 'clean' | 'toy' | string;
  description: string;
  price_coin: number;
  price_diamond: number;
  item_count: number;
  hunger_value: number;
  clean_value: number;
  mood_value: number;
  exp_value: number;
  icon: string;
  status: number;
  sort: number;
}

export class ShopManager {
  static goods: GoodsModel[] = [];

  static async list(): Promise<GoodsModel[]> {
    const res = await Http.get<{
      goods: GoodsModel[];
    }>('/api/shop/list');

    if (res.code !== 0) {
      throw new Error(res.message || '获取商城失败');
    }

    this.goods = res.data.goods || [];
    return this.goods;
  }

  static async buy(goodsId: number): Promise<string> {
    const res = await Http.post<{
      success: boolean;
      message: string;
      goods: GoodsModel;
      user?: any;
      bag?: any[];
    }>('/api/shop/buy', {
      goods_id: goodsId,
    });

    if (res.code !== 0) {
      throw new Error(res.message || '购买失败');
    }

    if (!res.data.success) {
      throw new Error(res.data.message || '购买失败');
    }

    if (res.data.user) {
      UserManager.updateUser(res.data.user);
    } else {
      await UserManager.getInfo();
    }

    await BagManager.list();

    return res.data.message || '购买成功';
  }
}
