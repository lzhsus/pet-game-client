import { _decorator, Component, Label } from 'cc';
import { UserManager } from '../manager/UserManager';
import { PetManager } from '../manager/PetManager';

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

  protected async start(): Promise<void> {
    await this.initGame();
  }

  private async initGame(): Promise<void> {
    try {
      this.setStatus('连接服务器中...');
      await UserManager.login();
      await PetManager.getInfo();
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
      this.petNameLabel.string = pet.name;
    }

    if (this.petInfoLabel && pet) {
      this.petInfoLabel.string = [
        `等级：${pet.level}`,
        `经验：${pet.exp}`,
        `饥饿：${pet.hunger}`,
        `清洁：${pet.clean}`,
        `心情：${pet.mood}`,
      ].join('\n');
    }
  }

  private setStatus(message: string): void {
    if (this.statusLabel) {
      this.statusLabel.string = message;
    }
  }
}
