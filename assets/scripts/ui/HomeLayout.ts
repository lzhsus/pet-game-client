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

    this.layoutBg(width, height);
    this.layoutTopBar(height);
  }

  private layoutBg(width: number, height: number): void {
    if (!this.bg) return;

    const transform = this.getTransform(this.bg);
    transform.setContentSize(width, height);
    this.bg.setPosition(new Vec3(0, 0, 0));
  }

  private layoutTopBar(screenHeight: number): void {
    if (!this.topBar) return;

    const y = screenHeight / 2 - this.topBarTop;
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
