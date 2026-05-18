import { _decorator, Component, director, Node } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('BottomNav')
export class BottomNav extends Component {
  @property(Node)
  homeButton: Node | null = null;

  @property(Node)
  taskButton: Node | null = null;

  @property(Node)
  bagButton: Node | null = null;

  @property(Node)
  shopButton: Node | null = null;

  @property(Node)
  signButton: Node | null = null;

  protected start(): void {
    this.refreshActiveTab();
  }

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

  private refreshActiveTab(): void {
    const currentSceneName = director.getScene()?.name || 'Home';

    this.setTabActive(this.homeButton, currentSceneName === 'Home');
    this.setTabActive(this.taskButton, currentSceneName === 'Task');
    this.setTabActive(this.bagButton, currentSceneName === 'Bag');
    this.setTabActive(this.shopButton, currentSceneName === 'Shop');
    this.setTabActive(this.signButton, currentSceneName === 'Sign');
  }

  private setTabActive(button: Node | null, active: boolean): void {
    if (!button) return;

    // 约定：每个按钮下面放一个名为 ActiveBg 的背景节点。
    // 当前场景对应的按钮显示 ActiveBg，其他按钮隐藏 ActiveBg。
    const activeBg = button.getChildByName('ActiveBg');
    if (activeBg) {
      activeBg.active = active;
    }
  }

  private goScene(sceneName: string): void {
    const currentScene = director.getScene();
    if (currentScene?.name === sceneName) return;

    director.loadScene(sceneName);
  }
}
