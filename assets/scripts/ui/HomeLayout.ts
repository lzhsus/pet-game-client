import { _decorator, Component, Node, UITransform, view, Vec3 } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('HomeLayout')
export class HomeLayout extends Component {
  @property(Node)
  bg: Node | null = null;

  @property(Node)
  topBar: Node | null = null;

  @property
  designWidth = 750;

  @property
  designHeight = 1600;

  @property
  topBarTop = 150;

  protected onLoad(): void {
    this.applyLayout();
    view.on('canvas-resize', this.applyLayout, this);
  }

  protected onDestroy(): void {
    view.off('canvas-resize', this.applyLayout, this);
  }

  private applyLayout(): void {
    const visibleSize = view.getVisibleSize();
    const width = visibleSize.width;
    const height = visibleSize.height;
    const scaleX = width / this.designWidth;
    const scaleY = height / this.designHeight;

    console.log(
      `[HomeLayout] screen=${width}x${height}, design=${this.designWidth}x${this.designHeight}, scaleX=${scaleX.toFixed(4)}, scaleY=${scaleY.toFixed(4)}`
    );

    this.layoutBg(width, height);
    this.layoutTopBar(height, scaleY);
  }

  private layoutBg(width: number, height: number): void {
    if (!this.bg) return;

    const transform = this.getTransform(this.bg);
    transform.setContentSize(width, height);
    this.bg.setPosition(new Vec3(0, 0, 0));
  }

  private layoutTopBar(screenHeight: number, scaleY: number): void {
    if (!this.topBar) return;

    const top = this.topBarTop * scaleY;
    const y = screenHeight / 2 - top;
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
