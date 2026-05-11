import { _decorator, Color, Component, Label, Node, resources, Sprite, SpriteFrame, UITransform, Vec3 } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('HomeUIStyle')
export class HomeUIStyle extends Component {
  @property(Node)
  bg: Node | null = null;

  @property(Node)
  topBar: Node | null = null;

  @property(Node)
  petArea: Node | null = null;

  @property(Node)
  bottomNav: Node | null = null;

  @property(Node)
  petSprite: Node | null = null;

  @property(Node)
  feedIcon: Node | null = null;

  @property(Node)
  bathIcon: Node | null = null;

  @property(Node)
  playIcon: Node | null = null;

  @property(Label)
  coinLabel: Label | null = null;

  @property(Label)
  diamondLabel: Label | null = null;

  @property(Label)
  petNameLabel: Label | null = null;

  @property(Label)
  petInfoLabel: Label | null = null;

  @property(Label)
  statusLabel: Label | null = null;

  @property(Label)
  feedButtonLabel: Label | null = null;

  @property(Label)
  bathButtonLabel: Label | null = null;

  @property(Label)
  playButtonLabel: Label | null = null;

  protected start(): void {
    this.apply();
  }

  public apply(): void {
    this.styleNode(this.bg, new Color(255, 244, 229, 255));
    this.resize(this.bg, 750, 1600);

    this.resize(this.topBar, 650, 96);
    this.move(this.topBar, 0, 680);
    this.styleNode(this.topBar, new Color(255, 255, 255, 230));

    this.resize(this.petArea, 620, 680);
    this.move(this.petArea, 0, 170);
    this.styleNode(this.petArea, new Color(255, 255, 255, 235));

    this.resize(this.bottomNav, 650, 140);
    this.move(this.bottomNav, 0, -590);
    this.styleNode(this.bottomNav, new Color(255, 255, 255, 220));

    this.resize(this.petSprite, 280, 280);
    this.move(this.petSprite, 0, 145);

    this.resize(this.feedIcon, 46, 46);
    this.resize(this.bathIcon, 46, 46);
    this.resize(this.playIcon, 46, 46);

    this.styleLabel(this.coinLabel, 30, new Color(107, 72, 42, 255), true);
    this.styleLabel(this.diamondLabel, 30, new Color(107, 72, 42, 255), true);
    this.styleLabel(this.petNameLabel, 42, new Color(72, 47, 31, 255), true);
    this.styleLabel(this.petInfoLabel, 28, new Color(118, 86, 61, 255), false);
    this.styleLabel(this.statusLabel, 28, new Color(255, 139, 38, 255), true);

    this.styleLabel(this.feedButtonLabel, 30, Color.WHITE, true, '喂食');
    this.styleLabel(this.bathButtonLabel, 30, Color.WHITE, true, '洗澡');
    this.styleLabel(this.playButtonLabel, 30, Color.WHITE, true, '玩耍');

    this.loadSprite(this.petSprite, 'textures/ui/pet/pet_cat/spriteFrame');
    this.loadSprite(this.feedIcon, 'textures/ui/icon/food/spriteFrame');
    this.loadSprite(this.bathIcon, 'textures/ui/icon/bath/spriteFrame');
    this.loadSprite(this.playIcon, 'textures/ui/icon/play/spriteFrame');
  }

  private loadSprite(node: Node | null, path: string): void {
    if (!node) return;

    resources.load(path, SpriteFrame, (error, spriteFrame) => {
      if (error || !spriteFrame) {
        console.warn(`资源加载失败：${path}`, error);
        return;
      }

      let sprite = node.getComponent(Sprite);
      if (!sprite) {
        sprite = node.addComponent(Sprite);
      }
      sprite.spriteFrame = spriteFrame;
      sprite.color = Color.WHITE;
    });
  }

  private styleNode(node: Node | null, color: Color): void {
    if (!node) return;

    let sprite = node.getComponent(Sprite);
    if (!sprite) {
      sprite = node.addComponent(Sprite);
    }
    sprite.color = color;
  }

  private resize(node: Node | null, width: number, height: number): void {
    if (!node) return;

    let transform = node.getComponent(UITransform);
    if (!transform) {
      transform = node.addComponent(UITransform);
    }
    transform.setContentSize(width, height);
  }

  private move(node: Node | null, x: number, y: number): void {
    if (!node) return;
    node.setPosition(new Vec3(x, y, 0));
  }

  private styleLabel(label: Label | null, size: number, color: Color, bold: boolean, text?: string): void {
    if (!label) return;

    label.fontSize = size;
    label.lineHeight = Math.round(size * 1.35);
    label.color = color;
    label.isBold = bold;

    if (text !== undefined) {
      label.string = text;
    }
  }
}
