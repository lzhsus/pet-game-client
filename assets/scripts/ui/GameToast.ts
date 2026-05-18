import { _decorator, Component, Label, Node, UIOpacity, Tween, tween, Vec3 } from 'cc';

const { ccclass, property } = _decorator;

type ToastItem = {
  message: string;
};

@ccclass('GameToast')
export class GameToast extends Component {
  private static instance: GameToast | null = null;
  private static pendingMessages: ToastItem[] = [];

  @property(Label)
  toastLabel: Label | null = null;

  @property(Node)
  toastBg: Node | null = null;

  @property
  showDuration = 1.5;

  @property
  fadeDuration = 0.15;

  @property
  maxQueueCount = 3;

  private opacity: UIOpacity | null = null;
  private hideTimer: number | null = null;
  private queue: ToastItem[] = [];
  private isShowing = false;

  protected onLoad(): void {
    GameToast.instance = this;
    this.opacity = this.node.getComponent(UIOpacity) || this.node.addComponent(UIOpacity);

    // GameToast 节点必须保持 active=true，避免 onLoad 不执行导致静态实例为空。
    // 隐藏只通过透明度控制，不关闭整个节点。
    this.node.active = true;
    this.node.setScale(Vec3.ONE);
    if (this.opacity) {
      this.opacity.opacity = 0;
    }

    if (GameToast.pendingMessages.length > 0) {
      this.queue.push(...GameToast.pendingMessages.splice(0));
      this.playNext();
    }
  }

  protected onDestroy(): void {
    this.clearHideTimer();
    Tween.stopAllByTarget(this.node);
    if (this.opacity) {
      Tween.stopAllByTarget(this.opacity);
    }

    if (GameToast.instance === this) {
      GameToast.instance = null;
    }
  }

  public static show(message: string): void {
    GameToast.enqueue(message);
  }

  public static showSuccess(message: string): void {
    GameToast.enqueue(message);
  }

  public static showError(message: string): void {
    GameToast.enqueue(message || '网络异常，请稍后再试');
  }

  private static enqueue(message: string): void {
    const safeMessage = (message || '').trim();
    if (!safeMessage) return;

    if (!GameToast.instance) {
      GameToast.pendingMessages.push({ message: safeMessage });
      GameToast.pendingMessages = GameToast.pendingMessages.slice(-3);
      return;
    }

    GameToast.instance.enqueueMessage(safeMessage);
  }

  private enqueueMessage(message: string): void {
    const lastQueueItem = this.queue[this.queue.length - 1];
    if (lastQueueItem?.message === message) {
      return;
    }

    if (this.isShowing && this.toastLabel?.string === message) {
      return;
    }

    this.queue.push({ message });

    if (this.queue.length > this.maxQueueCount) {
      this.queue.splice(0, this.queue.length - this.maxQueueCount);
    }

    if (!this.isShowing) {
      this.playNext();
    }
  }

  private playNext(): void {
    const item = this.queue.shift();
    if (!item) {
      this.isShowing = false;
      this.hideImmediately();
      return;
    }

    this.isShowing = true;
    this.showMessage(item.message);
  }

  private showMessage(message: string): void {
    this.clearHideTimer();

    if (this.toastLabel) {
      this.toastLabel.string = message;
    }

    this.node.active = true;
    this.node.setScale(Vec3.ONE);

    Tween.stopAllByTarget(this.node);
    if (this.opacity) {
      Tween.stopAllByTarget(this.opacity);
      this.opacity.opacity = 0;
    }

    if (this.opacity) {
      tween(this.opacity)
        .to(this.fadeDuration, { opacity: 255 })
        .start();
    }

    tween(this.node)
      .to(this.fadeDuration, { scale: new Vec3(1.04, 1.04, 1) })
      .to(this.fadeDuration, { scale: Vec3.ONE })
      .start();

    this.hideTimer = window.setTimeout(() => {
      this.hideTimer = null;
      this.hideCurrent();
    }, this.showDuration * 1000);
  }

  private hideCurrent(): void {
    if (!this.opacity) {
      this.playNext();
      return;
    }

    Tween.stopAllByTarget(this.opacity);
    tween(this.opacity)
      .to(this.fadeDuration, { opacity: 0 })
      .call(() => {
        this.playNext();
      })
      .start();
  }

  private hideImmediately(): void {
    this.clearHideTimer();
    Tween.stopAllByTarget(this.node);
    if (this.opacity) {
      Tween.stopAllByTarget(this.opacity);
      this.opacity.opacity = 0;
    }
    this.node.setScale(Vec3.ONE);
  }

  private clearHideTimer(): void {
    if (this.hideTimer !== null) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
  }
}
