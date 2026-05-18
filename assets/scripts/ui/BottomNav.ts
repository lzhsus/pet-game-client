import { _decorator, Component, director, Node, sys, UITransform, view, Vec3 } from 'cc';

const { ccclass, property } = _decorator;

declare const wx: any;

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
  @property
  activeTab = '';

  // 设计稿高度，用来做比例换算。
  @property
  designHeight = 1600;

  // BottomNav 和底部安全区之间的额外距离。
  @property
  bottomGap = 24;

  protected onLoad(): void {
    this.applyLayout();
    view.on('canvas-resize', this.applyLayout, this);
  }

  protected start(): void {
    this.refreshActiveTab();
  }

  protected onDestroy(): void {
    view.off('canvas-resize', this.applyLayout, this);
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

  private applyLayout(): void {
    const visibleSize = view.getVisibleSize();
    const screenHeight = visibleSize.height;
    const scaleY = screenHeight / this.designHeight;
    const safeBottom = this.getWechatBottomSafeArea(screenHeight);

    const transform = this.node.getComponent(UITransform);
    const navHeight = transform ? transform.height : 0;

    const y = -screenHeight / 2 + safeBottom + this.bottomGap * scaleY + navHeight / 2;

    this.node.setPosition(new Vec3(0, y, 0));
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

  private getWechatBottomSafeArea(screenHeight: number): number {
    if (sys.platform !== sys.Platform.WECHAT_GAME || typeof wx === 'undefined') {
      return 0;
    }

    try {
      const info = wx.getSystemInfoSync ? wx.getSystemInfoSync() : null;
      if (!info) return 0;

      const windowHeight = Number(info.windowHeight || info.screenHeight || 0);
      if (windowHeight <= 0) return 0;

      const safeAreaBottom = Number(info.safeArea?.bottom || windowHeight);
      const bottomSafePx = Math.max(windowHeight - safeAreaBottom, 0);

      return bottomSafePx * (screenHeight / windowHeight);
    } catch (error) {
      console.warn('[BottomNav] failed to read WeChat bottom safe area', error);
      return 0;
    }
  }

  private goScene(sceneName: string): void {
    const currentScene = director.getScene();
    if (currentScene?.name === sceneName) return;

    director.loadScene(sceneName);
  }
}
