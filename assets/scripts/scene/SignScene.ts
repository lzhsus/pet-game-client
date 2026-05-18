import { _decorator, Component, Node } from 'cc';
import { RewardManager } from '../manager/RewardManager';
import { GameToast } from '../ui/GameToast';

const { ccclass, property } = _decorator;

@ccclass('SignScene')
export class SignScene extends Component {
  @property([Node])
  dayNodes: Node[] = [];

  @property(Node)
  signButton: Node | null = null;

  protected async start(): Promise<void> {
    await this.loadWeekData();
  }

  private async loadWeekData(): Promise<void> {
    try {
      await RewardManager.getWeekSign();
      this.refreshView();
    } catch (error) {
      console.error(error);
      GameToast.showError(
        error instanceof Error
          ? error.message
          : '签到数据加载失败'
      );
    }
  }

  private refreshView(): void {
    const weekData = RewardManager.weekSign;

    if (!weekData) {
      return;
    }

    weekData.week.forEach((item, index) => {
      const dayNode = this.dayNodes[index];

      if (!dayNode) {
        return;
      }

      const receivedMask =
        dayNode.getChildByName('ReceivedMask');

      if (receivedMask) {
        receivedMask.active = item.signed;
      }
    });

    if (this.signButton) {
      this.signButton.active =
        !weekData.today_signed;
    }
  }

  public async onClickSign(): Promise<void> {
    try {
      const reward =
        await RewardManager.dailySign();

      GameToast.showSuccess(
        reward.message || '签到成功'
      );

      this.refreshView();
    } catch (error) {
      console.error(error);

      GameToast.showError(
        error instanceof Error
          ? error.message
          : '签到失败'
      );
    }
  }
}