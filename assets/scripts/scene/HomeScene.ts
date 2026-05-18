import { _decorator, Component, Label, Node, UITransform } from 'cc';
import { UserManager } from '../manager/UserManager';
import { PetManager } from '../manager/PetManager';
import { TaskManager } from '../manager/TaskManager';
import { BagManager } from '../manager/BagManager';
import { ShopManager } from '../manager/ShopManager';
import { RewardManager } from '../manager/RewardManager';

const { ccclass, property } = _decorator;

@ccclass('HomeScene')
export class HomeScene extends Component {
  @property(Label)
  coinLabel: Label | null = null;

  @property(Label)
  diamondLabel: Label | null = null;

  @property(Label)
  petNameLabel: Label | null = null;

  @property(Label)
  petInfoLabel: Label | null = null;

  @property(Label)
  statusLabel: Label | null = null;

  @property(Node)
  hungerBarFill: Node | null = null;

  @property(Node)
  cleanBarFill: Node | null = null;

  @property(Node)
  moodBarFill: Node | null = null;

  @property
  statusBarMaxWidth = 132;

  private readonly refreshIntervalSeconds = 60;

  protected async start(): Promise<void> {
    await this.initGame();
    this.schedule(this.refreshRemoteData, this.refreshIntervalSeconds);
  }

  protected onDestroy(): void {
    this.unschedule(this.refreshRemoteData);
  }

  private async initGame(): Promise<void> {
    try {
      this.setStatus('连接服务器中...');
      await UserManager.login();
      await UserManager.getInfo();
      await PetManager.getInfo();
      await TaskManager.list();
      await BagManager.list();
      await ShopManager.list();
      this.refreshView();
      this.setStatus('服务器连接成功');
    } catch (error) {
      console.error(error);
      this.setStatus(error instanceof Error ? error.message : '连接失败');
    }
  }

  public async onClickFeed(): Promise<void> {
    await this.runPetAction('feed', '喂食成功');
  }

  public async onClickBath(): Promise<void> {
    await this.runPetAction('bath', '洗澡成功');
  }

  public async onClickPlay(): Promise<void> {
    await this.runPetAction('play', '玩耍成功');
  }
  
  public async onClickDailySign(): Promise<void> {
    try {
      this.setStatus('签到中...');
      const reward = await RewardManager.dailySign();
      await UserManager.getInfo();
      this.refreshView();
      this.setStatus(reward.message || '签到完成');
    } catch (error) {
      console.error(error);
      this.setStatus(error instanceof Error ? error.message : '签到失败');
    }
  }

  public async onClickRefresh(): Promise<void> {
    await this.refreshRemoteData();
  }

  private async refreshRemoteData(): Promise<void> {
    try {
      await UserManager.getInfo();
      await PetManager.getInfo();
      this.refreshView();
    } catch (error) {
      console.error(error);
      this.setStatus(error instanceof Error ? error.message : '刷新失败');
    }
  }

  private async runPetAction(type: 'feed' | 'bath' | 'play', message: string): Promise<void> {
    try {
      this.setStatus('操作中...');

      if (type === 'feed') {
        await PetManager.feed();
      }

      if (type === 'bath') {
        await PetManager.bath();
      }

      if (type === 'play') {
        await PetManager.play();
      }

      await UserManager.getInfo();
      await TaskManager.list();
      await BagManager.list();
      this.refreshView();
      this.setStatus(message);
    } catch (error) {
      console.error(error);
      this.setStatus(error instanceof Error ? error.message : '操作失败');
    }
  }

  private refreshView(): void {
    const user = UserManager.user;
    const pet = PetManager.pet;

    if (this.coinLabel && user) {
      this.coinLabel.string = `金币：${user.coin}`;
    }

    if (this.diamondLabel && user) {
      this.diamondLabel.string = `钻石：${user.diamond}`;
    }

    if (this.petNameLabel && pet) {
      this.petNameLabel.string = pet.name || '未知宠物';
    }

    if (this.petInfoLabel && pet) {
      this.petInfoLabel.string = [
        `等级：${pet.level}    经验：${pet.exp}`,
        `饥饿：${pet.hunger}   清洁：${pet.clean}    心情：${pet.mood}`,
      ].join('\n');
    }

    if (pet) {
      this.setBarValue(this.hungerBarFill, pet.hunger);
      this.setBarValue(this.cleanBarFill, pet.clean);
      this.setBarValue(this.moodBarFill, pet.mood);
    }
  }

  private setBarValue(barNode: Node | null, value: number): void {
    if (!barNode) return;

    const transform = barNode.getComponent(UITransform);
    if (!transform) return;

    const percent = Math.max(0, Math.min(100, Number(value) || 0)) / 100;
    transform.setContentSize(this.statusBarMaxWidth * percent, transform.height);
  }

  private setStatus(message: string): void {
    if (this.statusLabel) {
      this.statusLabel.string = message;
    }
  }
}
