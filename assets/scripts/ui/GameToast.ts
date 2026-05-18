import { _decorator, Component, Label, Node, UIOpacity, tween, Vec3 } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('GameToast')
export class GameToast extends Component {
  private static instance: GameToast | null = null;

  @property(Label)
  toastLabel: Label | null = null;

  @property(Node)
  toastBg: Node | null = null;

  @property
  showDuration = 1.5;

  @property
  fadeDuration = 0.15;

  private opacity: UIOpacity | null = null;
  private hideTimer: number | null = null;

  protected onLoad(): void {
    GameToast.instance = this;
    this.opacity = this.node.getComponent(UIOpacity) || this.node.addComponent(UIOpacity);
    this.node.active = false;
  }

  protected onDestroy(): void {
    if (GameToast.instance === this) {
      GameToast.instance = null;
    }
  }

  public static show(message: string): void {
    GameToast.instance?.showMessage(message);
  }

  public static showSuccess(message: string): void {
    GameToast.show(message);
  }

  public static showError(message: string): void {
    GameToast.show(message || '网络异常，请稍后再试');
  }

  private showMessage(message: string): void {
    if (!message) return;

    if (this.hideTimer !== null) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }

    if (this.toastLabel) {
      this.toastLabel.string = message;
    }

    this.node.active = true;
    this.node.setScale(Vec3.ONE);

    if (this.opacity) {
      this.opacity.opacity = 0;
    }

    tween(this.node).stop();
    tween(this.opacity)
      .stop()
      .to(this.fadeDuration, { opacity: 255 })
      .start();

    tween(this.node)
      .to(this.fadeDuration, { scale: new Vec3(1.04, 1.04, 1) })
      .to(this.fadeDuration, { scale: Vec3.ONE })
      .start();

    this.hideTimer = window.setTimeout(() => {
      this.hideTimer = null;
      this.hide();
    }, this.showDuration * 1000);
  }

  private hide(): void {
    if (!this.opacity) {
      this.node.active = false;
      return;
    }

    tween(this.opacity)
      .stop()
      .to(this.fadeDuration, { opacity: 0 })
      .call(() => {
        this.node.active = false;
      })
      .start();
  }
}
