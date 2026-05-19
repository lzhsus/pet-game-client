import { _decorator, Button, Component, instantiate, Label, Node, tween, UITransform, Vec3 } from 'cc';
import { ApiConfig } from '../core/ApiConfig';
import { BagItemModel, BagManager } from '../manager/BagManager';
import { UserManager } from '../manager/UserManager';
import { GameToast } from '../ui/GameToast';

const { ccclass, property } = _decorator;

@ccclass('BagScene')
export class BagScene extends Component {
  @property(Node)
  content: Node | null = null;

  @property(Node)
  bagItemTemplate: Node | null = null;

  @property
  itemGap = 12;

  @property
  pressScale = 1.08;

  @property
  pressDuration = 0.1;

  protected async start(): Promise<void> {
    if (this.bagItemTemplate) {
      this.bagItemTemplate.active = false;
    }

    await this.loadItems();
  }

  private async ensureLogin(): Promise<void> {
    if (ApiConfig.token) return;
    await UserManager.login();
  }

  private async loadItems(): Promise<void> {
    try {
      await this.ensureLogin();
      await BagManager.list();
      this.renderItems();
    } catch (error) {
      console.error(error);
      GameToast.showError(error instanceof Error ? error.message : '背包加载失败');
    }
  }

  private renderItems(): void {
    if (!this.content || !this.bagItemTemplate) {
      GameToast.showError('背包节点未绑定');
      return;
    }

    this.content.removeAllChildren();

    const items = BagManager.items.filter((item) => item.item_count > 0);

    const templateTransform = this.bagItemTemplate.getComponent(UITransform);
    const itemHeight = templateTransform?.height || 150;

    const totalHeight = items.length > 0
      ? items.length * itemHeight + Math.max(items.length - 1, 0) * this.itemGap
      : 0;

    const contentTransform = this.content.getComponent(UITransform);
    if (contentTransform) {
      contentTransform.setContentSize(contentTransform.width, totalHeight);
    }

    items.forEach((item, index) => {
      const node = instantiate(this.bagItemTemplate!);
      node.name = `BagItem_${item.id}`;
      node.active = true;
      node.parent = this.content!;

      const y = -itemHeight / 2 - index * (itemHeight + this.itemGap);
      node.setPosition(new Vec3(0, y, 0));

      this.renderBagItem(node, item);
    });
  }

  private renderBagItem(node: Node, item: BagItemModel): void {
    this.setLabel(node, 'NameLabel', item.item_name || '未知物品');
    this.setLabel(node, 'TypeLabel', this.getTypeName(item.item_type));
    this.setLabel(node, 'CountLabel', `x${item.item_count}`);
    this.setLabel(node, 'EffectLabel', this.getEffectText(item));

    const useButton = node.getChildByName('UseButton');
    const buttonLabel = useButton?.getChildByName('ButtonLabel')?.getComponent(Label);

    if (buttonLabel) {
      buttonLabel.string = '使用';
    }

    if (useButton) {
      useButton.off(Button.EventType.CLICK);
      useButton.on(Button.EventType.CLICK, () => {
        this.playButtonPress(useButton, () => {
          GameToast.show('使用功能开发中');
        });
      }, this);
    }
  }

  private getTypeName(type: string): string {
    if (type === 'food') return '食物';
    if (type === 'clean') return '清洁';
    if (type === 'toy') return '玩具';
    return '物品';
  }

  private getEffectText(item: BagItemModel): string {
    const effects: string[] = [];

    if (item.hunger_value > 0) {
      effects.push(`饥饿 +${item.hunger_value}`);
    }

    if (item.clean_value > 0) {
      effects.push(`清洁 +${item.clean_value}`);
    }

    if (item.mood_value > 0) {
      effects.push(`心情 +${item.mood_value}`);
    }

    if (item.exp_value > 0) {
      effects.push(`经验 +${item.exp_value}`);
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
