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
    const screenWidth = visibleSize.width;
    const screenHeight = visibleSize.height;

    // 真实屏幕与 750 × 1600 设计稿之间的换算比例。
    const scaleX = screenWidth / this.designWidth;
    const scaleY = screenHeight / this.designHeight;

    console.log(
      `[HomeLayout] screen=${screenWidth}x${screenHeight}, design=${this.designWidth}x${this.designHeight}, scaleX=${scaleX.toFixed(4)}, scaleY=${scaleY.toFixed(4)}`
    );

    this.layoutBg(screenWidth, screenHeight);
    this.layoutTopBar(screenHeight, scaleY);
  }

  private layoutBg(screenWidth: number, screenHeight: number): void {
    if (!this.bg) return;

    // 背景永远按当前设备可视区域铺满，不使用设计稿尺寸。
    const transform = this.getTransform(this.bg);
    transform.setContentSize(screenWidth, screenHeight);
    this.bg.setPosition(new Vec3(0, 0, 0));
  }

  private layoutTopBar(screenHeight: number, scaleY: number): void {
    if (!this.topBar) return;

    // 将设计稿 top 值换算成当前设备的 top 值。
    const realTop = this.topBarDesignTop * scaleY;

    // Cocos UI 坐标原点在 Canvas 中心：顶部 y = screenHeight / 2。
    // 所以节点 y = 顶部坐标 - 真实 top 距离。
    const y = screenHeight / 2 - realTop;
    this.topBar.setPosition(new Vec3(0, y, 0));
  }

  private getTransform(node: Node): UITransform {
    let transform = node.getComponent(UITransform);
    if (!transform) {
      transform = node.addComponent(UITransform);
    }
    return transform;
  }
}
