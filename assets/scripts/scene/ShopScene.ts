import { _decorator, Button, Component, Label, Node, instantiate, UITransform, Vec3, tween } from 'cc';
import { ApiConfig } from '../core/ApiConfig';
import { ShopManager, GoodsModel } from '../manager/ShopManager';
import { UserManager } from '../manager/UserManager';
import { GameToast } from '../ui/GameToast';

const { ccclass, property } = _decorator;

@ccclass('ShopScene')
export class ShopScene extends Component {
  @property(Node)
  content: Node | null = null;

  @property(Node)
  goodsItemTemplate: Node | null = null;

  @property
  itemGap = 0;

  @property
  pressScale = 1.08;

  @property
  pressDuration = 0.1;

  protected async start(): Promise<void> {
    if (this.goodsItemTemplate) {
      this.goodsItemTemplate.active = false;
    }

    await this.loadGoods();
  }

  private async ensureLogin(): Promise<void> {
    if (ApiConfig.token) return;
    await UserManager.login();
  }

  private async loadGoods(): Promise<void> {
    try {
      await this.ensureLogin();
      await ShopManager.list();
      this.renderGoods();
    } catch (error) {
      console.error(error);
      GameToast.showError(error instanceof Error ? error.message : '商城加载失败');
    }
  }

  private renderGoods(): void {
    if (!this.content || !this.goodsItemTemplate) {
      GameToast.showError('商城列表节点未绑定');
      return;
    }

    this.content.removeAllChildren();

    const goodsList = ShopManager.goods;
    const templateTransform = this.goodsItemTemplate.getComponent(UITransform);
    const itemHeight = templateTransform?.height || 150;
    const totalHeight = goodsList.length > 0
      ? goodsList.length * itemHeight + Math.max(goodsList.length - 1, 0) * this.itemGap
      : 0;

    const contentTransform = this.content.getComponent(UITransform);
    if (contentTransform) {
      contentTransform.setContentSize(contentTransform.width, totalHeight);
    }

    goodsList.forEach((goods, index) => {
      const item = instantiate(this.goodsItemTemplate!);
      item.name = `ShopGoods_${goods.id}`;
      item.active = true;
      item.parent = this.content!;

      const y = -itemHeight / 2 - index * (itemHeight + this.itemGap);
      item.setPosition(new Vec3(0, y, 0));

      this.renderGoodsItem(item, goods);
    });
  }

  private renderGoodsItem(item: Node, goods: GoodsModel): void {
    this.setLabel(item, 'NameLabel', goods.goods_name || '商品');
    this.setLabel(item, 'TypeLabel', this.getTypeName(goods.goods_type));
    this.setLabel(item, 'DescriptionLabel', goods.description || '');
    this.setLabel(item, 'EffectLabel', this.getEffectText(goods));
    this.setLabel(item, 'PriceLabel', `${goods.price_coin} 金币`);

    const buyButton = item.getChildByName('BuyButton');
    const buttonLabel = buyButton?.getChildByName('ButtonLabel')?.getComponent(Label);
    const button = buyButton?.getComponent(Button);

    if (buttonLabel) {
      buttonLabel.string = '购买';
    }

    if (button) {
      button.interactable = true;
    }

    if (buyButton) {
      buyButton.off(Button.EventType.CLICK);
      buyButton.on(Button.EventType.CLICK, () => {
        this.playButtonPress(buyButton, () => {
          void this.buyGoods(goods.id);
        });
      }, this);
    }
  }

  private async buyGoods(goodsId: number): Promise<void> {
    try {
      await this.ensureLogin();
      const message = await ShopManager.buy(goodsId);
      GameToast.showSuccess(message || '购买成功');
      this.renderGoods();
    } catch (error) {
      console.error(error);
      GameToast.showError(error instanceof Error ? error.message : '购买失败');
    }
  }

  private getTypeName(type: string): string {
    if (type === 'food') return '食物';
    if (type === 'clean') return '清洁';
    if (type === 'toy') return '玩具';
    return '商品';
  }

  private getEffectText(goods: GoodsModel): string {
    const effects: string[] = [];

    if (goods.hunger_value > 0) {
      effects.push(`饥饿 +${goods.hunger_value}`);
    }

    if (goods.clean_value > 0) {
      effects.push(`清洁 +${goods.clean_value}`);
    }

    if (goods.mood_value > 0) {
      effects.push(`心情 +${goods.mood_value}`);
    }

    if (goods.exp_value > 0) {
      effects.push(`经验 +${goods.exp_value}`);
    }

    return effects.length > 0 ? effects.join('  ') : '暂无效果';
  }

  private setLabel(root: Node, childName: string, value: string): void {
    const label = root.getChildByName(childName)?.getComponent(Label);
    if (label) {
      label.string = value;
    }
  }

  private playButtonPress(node: Node, callback: () => void): void {
    tween(node)
      .stop()
      .to(this.pressDuration, { scale: new Vec3(this.pressScale, this.pressScale, 1) })
      .to(this.pressDuration, { scale: Vec3.ONE })
      .call(callback)
      .start();
  }
}
