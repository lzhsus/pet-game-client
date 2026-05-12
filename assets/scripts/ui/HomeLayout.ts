import { _decorator, Component, Node, UITransform, view, Vec3 } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('HomeLayout')
export class HomeLayout extends Component {
  @property(Node)
  bg: Node | null = null;

  @property(Node)
  topBar: Node | null = null;

  // Figma / Cocos 设计稿尺寸。这里不是设备真实尺寸，只是我们的坐标基准。
  @property
  designWidth = 750;

  @property
  designHeight = 1600;

  // 设计稿里 TopBar 距离设计稿顶部的距离。
  // 注意：真实设备会用 screenHeight / designHeight 自动换算，不要直接当成最终像素。
  @property
  topBarDesignTop = 150;

  protected onLoad(): void {
    this.applyLayout();
    view.on('canvas-resize', this.applyLayout, this);
  }

  protected onDestroy(): void {
    view.off('canvas-resize', this.applyLayout, this);
  }

  private applyLayout(): void {
    // 当前设备 / 微信小游戏当前可视区域尺寸。不同手机这里会不一样。
    const visibleSize = view.getVisibleSize();
    const width = visibleSize.width;
    const height = visibleSize.height;

    this.layoutBg(height);
    this.layoutTopBar(height);
  }

  private layoutBg(height: number): void {
    if (!this.bg) return;
    this.bg.setPosition(new Vec3(0, height/2, 0));
  }

  private layoutTopBar(height: number): void {
    if (!this.topBar) return;

    // 你需要获取不同设备  头部的高度
    const designTop = 100;

    this.topBar.setPosition(new Vec3(0, height/2 - designTop, 0));
  }

}
