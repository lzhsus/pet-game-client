import { _decorator, Button, Component, Label, Node, Sprite, SpriteFrame, tween, Vec3 } from 'cc';
import { ApiConfig } from '../core/ApiConfig';
import { RewardManager, WeekSignDay } from '../manager/RewardManager';
import { UserManager } from '../manager/UserManager';
import { TaskManager } from '../manager/TaskManager';
import { GameToast } from '../ui/GameToast';

const { ccclass, property } = _decorator;

@ccclass('SignScene')
export class SignScene extends Component {
  @property([Node])
  dayNodes: Node[] = [];

  @property(Node)
  signButton: Node | null = null;

  // 已签到状态背景
  @property(SpriteFrame)
  signedSprite: SpriteFrame | null = null;

  // 漏签状态背景：今天之前，但是没有签到
  @property(SpriteFrame)
  missedSprite: SpriteFrame | null = null;

  // 普通状态背景：今天和未来日期
  @property(SpriteFrame)
  normalSprite: SpriteFrame | null = null;

  @property
  pressScale = 1.08;

  @property
  pressDuration = 0.1;

  protected async start(): Promise<void> {
    await this.loadWeekSign();
  }

  private async ensureLogin(): Promise<void> {
    if (ApiConfig.token) return;

    GameToast.show('登录中...');
    await UserManager.login();
  }

  private async loadWeekSign(): Promise<void> {
    try {
      await this.ensureLogin();
      await RewardManager.getWeekSign();
      this.refreshView();
    } catch (error) {
      console.error(error);
      GameToast.showError(error instanceof Error ? error.message : '签到数据加载失败');
    }
  }

  public async onClickSign(): Promise<void> {
    if (this.signButton) {
      await this.playButtonPress(this.signButton);
    }

    try {
      await this.ensureLogin();
      const reward = await RewardManager.dailySign();

      await UserManager.getInfo();
      await TaskManager.list();

      this.refreshView();
      GameToast.showSuccess(reward.message || '签到成功');
    } catch (error) {
      console.error(error);
      GameToast.showError(error instanceof Error ? error.message : '签到失败');
    }
  }

  private refreshView(): void {
    const weekSign = RewardManager.weekSign;
    if (!weekSign) return;

    weekSign.week.forEach((item, index) => {
      this.renderDayNode(this.dayNodes[index], item);
    });

    this.refreshSignButton(weekSign.today_signed);
  }

  private renderDayNode(dayNode: Node | undefined, item: WeekSignDay): void {
    if (!dayNode) return;

    this.setLabel(dayNode, 'DayLabel', `第 ${item.day_no} 天`);
    this.setLabel(dayNode, 'RewardLabel', `+${item.reward_coin}`);

    const bgSprite = dayNode.getChildByName('Bg')?.getComponent(Sprite);
    if (!bgSprite) return;

    if (item.signed && this.signedSprite) {
      bgSprite.spriteFrame = this.signedSprite;
      return;
    }

    if (!item.signed && !item.is_today && !item.is_future && this.missedSprite) {
      bgSprite.spriteFrame = this.missedSprite;
      return;
    }

    if (this.normalSprite) {
      bgSprite.spriteFrame = this.normalSprite;
    }
  }

  private refreshSignButton(todaySigned: boolean): void {
    if (!this.signButton) return;

    const button = this.signButton.getComponent(Button);
    if (button) {
      button.interactable = !todaySigned;
    }

    const buttonLabel = this.signButton.getChildByName('ButtonLabel')?.getComponent(Label);
    if (buttonLabel) {
      buttonLabel.string = todaySigned ? '今日已签到' : '立即签到领取';
    }
  }

  private setLabel(root: Node, childName: string, value: string): void {
    const label = root.getChildByName(childName)?.getComponent(Label);
    if (label) {
      label.string = value;
    }
  }

  private playButtonPress(node: Node): Promise<void> {
    return new Promise((resolve) => {
      tween(node)
        .stop()
        .to(this.pressDuration, { scale: new Vec3(this.pressScale, this.pressScale, 1) })
        .to(this.pressDuration, { scale: Vec3.ONE })
        .call(resolve)
        .start();
    });
  }
}
