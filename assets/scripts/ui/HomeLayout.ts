import { _decorator, Component, Node, sys, UITransform, view, Vec3 } from 'cc';

const { ccclass, property } = _decorator;

declare const wx: any;

@ccclass('HomeLayout')
export class HomeLayout extends Component {
  @property(Node)
  bg: Node | null = null;

  @property(Node)
  topBar: Node | null = null;

  // Figma / Cocos 设计稿尺寸。这里只作为普通内容间距的换算基准。
  @property
  designWidth = 750;

  @property
  designHeight = 1600;

  // TopBar 在设备安全区下面额外保留的间距，不是固定头部高度。
  @property
  topBarSafePadding = 24;

  protected onLoad(): void {
    this.applyLayout();
    view.on('canvas-resize', this.applyLayout, this);
  }

  protected onDestroy(): void {
    view.off('canvas-resize', this.applyLayout, this);
  }

  private applyLayout(): void {
    // Cocos 当前可视区域，单位是 Cocos UI 坐标。
    const visibleSize = view.getVisibleSize();
    const screenWidth = visibleSize.width;
    const screenHeight = visibleSize.height;

    // 微信设备安全区顶部，单位转换成 Cocos UI 坐标。
    const safeTop = this.getSafeTopInCocosUnits(screenHeight);

    console.log(`[HomeLayout] screen=${screenWidth}x${screenHeight}, safeTop=${safeTop}`);

    this.layoutBg(screenWidth, screenHeight);
    this.layoutTopBar(screenHeight, safeTop);
  }

  private layoutBg(screenWidth: number, screenHeight: number): void {
    if (!this.bg) return;

    // 背景按当前设备可视区域铺满。
    const transform = this.getTransform(this.bg);
    transform.setContentSize(screenWidth, screenHeight);
    this.bg.setPosition(new Vec3(0, 0, 0));
  }

  private layoutTopBar(screenHeight: number, safeTop: number): void {
    if (!this.topBar) return;

    const topBarTransform = this.topBar.getComponent(UITransform);
    const topBarHeight = topBarTransform ? topBarTransform.height : 0;

    // 顶部坐标是 screenHeight / 2。
    // safeTop 是设备刘海/状态栏/微信顶部安全区。
    // topBarSafePadding 是安全区下面的视觉留白。
    // 这里按节点中心点定位，所以还要减掉 TopBar 自身高度的一半。
    const y = screenHeight / 2 - safeTop - this.topBarSafePadding - topBarHeight / 2;

    this.topBar.setPosition(new Vec3(0, y, 0));
  }

  private getSafeTopInCocosUnits(screenHeight: number): number {
    if (!sys.isNative && typeof wx !== 'undefined' && wx.getSystemInfoSync) {
      try {
        const info = wx.getSystemInfoSync();
        const windowHeight = Number(info.windowHeight || 0);
        const safeAreaTop = Number(info.safeArea?.top || 0);
        const statusBarHeight = Number(info.statusBarHeight || 0);
        const topInPx = safeAreaTop > 0 ? safeAreaTop : statusBarHeight;

        if (windowHeight > 0 && topInPx > 0) {
          return topInPx * (screenHeight / windowHeight);
        }
      } catch (error) {
        console.warn('[HomeLayout] wx.getSystemInfoSync failed', error);
      }
    }

    return 0;
  }

  private getTransform(node: Node): UITransform {
    let transform = node.getComponent(UITransform);
    if (!transform) {
      transform = node.addComponent(UITransform);
    }
    return transform;
  }
}
