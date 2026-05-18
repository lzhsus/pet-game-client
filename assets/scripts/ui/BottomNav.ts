import { _decorator, Component, director } from 'cc';

const { ccclass } = _decorator;

@ccclass('BottomNav')
export class BottomNav extends Component {
  public onClickHome(): void {
    this.goScene('Home');
  }

  public onClickTask(): void {
    this.goScene('Task');
  }

  public onClickBag(): void {
    this.goScene('Bag');
  }

  public onClickShop(): void {
    this.goScene('Shop');
  }

  public onClickSign(): void {
    this.goScene('Sign');
  }

  private goScene(sceneName: string): void {
    const currentScene = director.getScene();
    if (currentScene?.name === sceneName) return;

    director.loadScene(sceneName);
  }
}
