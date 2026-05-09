import { Http } from '../core/Http';
import { UserManager } from './UserManager';
import { BagManager } from './BagManager';

export interface GoodsModel {
  id: number;
  goods_name: string;
  goods_type: string;
  price_coin: number;
  price_diamond: number;
  status: number;
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

  static async buy(goodsId: number): Promise<void> {
    const res = await Http.post<{
      success: boolean;
      message: string;
      goods: GoodsModel;
      user?: any;
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
  }
}
