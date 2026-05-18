import { _decorator, Component, director, Node } from 'cc';

const { ccclass, property } = _decorator;

type TabName = 'Home' | 'Task' | 'Bag' | 'Shop' | 'Sign';

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

  // 当前页面对应的 tab。
  // 如果你的场景名不是 Home / Task / Bag / Shop / Sign，直接在 Cocos 里手动填写这个字段。
  // 例如：任务页填 Task，背包页填 Bag。
  @property
  activeTab = '';

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
    const activeTab = this.getActiveTab(currentSceneName);

    this.setTabActive(this.homeButton, activeTab === 'Home');
    this.setTabActive(this.taskButton, activeTab === 'Task');
    this.setTabActive(this.bagButton, activeTab === 'Bag');
    this.setTabActive(this.shopButton, activeTab === 'Shop');
    this.setTabActive(this.signButton, activeTab === 'Sign');
  }

  private getActiveTab(sceneName: string): TabName {
    const tab = this.activeTab.trim();

    if (tab === 'Home' || tab === 'Task' || tab === 'Bag' || tab === 'Shop' || tab === 'Sign') {
      return tab;
    }

    if (sceneName.includes('Task')) return 'Task';
    if (sceneName.includes('Bag')) return 'Bag';
    if (sceneName.includes('Shop')) return 'Shop';
    if (sceneName.includes('Sign')) return 'Sign';

    return 'Home';
  }

  private setTabActive(button: Node | null, active: boolean): void {
    if (!button) return;

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
