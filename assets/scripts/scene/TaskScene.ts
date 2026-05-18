import { _decorator, Component, Label, Node, Button, Sprite, SpriteFrame, instantiate, UITransform, Vec3, tween, director } from 'cc';
import { ApiConfig } from '../core/ApiConfig';
import { TaskManager, TaskModel } from '../manager/TaskManager';
import { UserManager } from '../manager/UserManager';

const { ccclass, property } = _decorator;

@ccclass('TaskScene')
export class TaskScene extends Component {
  @property(Node)
  content: Node | null = null;

  @property(Node)
  taskItemTemplate: Node | null = null;

  @property(Label)
  statusLabel: Label | null = null;

  // 未完成 / 可领取按钮背景：task-btn-02
  @property(SpriteFrame)
  taskButtonActiveSprite: SpriteFrame | null = null;

  // 已完成按钮背景：task-btn-01
  @property(SpriteFrame)
  taskButtonDoneSprite: SpriteFrame | null = null;

  @property
  itemGap = 0;

  @property
  pressScale = 1.2;

  @property
  pressDuration = 0.1;

  protected async start(): Promise<void> {
    if (this.taskItemTemplate) {
      this.taskItemTemplate.active = false;
    }

    await this.loadTasks();
  }

  public async onClickRefresh(): Promise<void> {
    await this.loadTasks();
  }

  private async ensureLogin(): Promise<void> {
    if (ApiConfig.token) return;

    this.setStatus('登录中...');
    await UserManager.login();
  }

  private async loadTasks(): Promise<void> {
    try {
      await this.ensureLogin();
      this.setStatus('加载任务中...');
      await TaskManager.list();
      this.renderTasks();
      this.setStatus('每日任务已更新');
    } catch (error) {
      console.error(error);
      this.setStatus(error instanceof Error ? error.message : '任务加载失败');
    }
  }

  private renderTasks(): void {
    if (!this.content || !this.taskItemTemplate) {
      this.setStatus('任务列表节点未绑定');
      return;
    }

    this.content.removeAllChildren();

    const tasks = TaskManager.tasks;
    const templateTransform = this.taskItemTemplate.getComponent(UITransform);
    const itemHeight = templateTransform?.height || 150;
    const totalHeight = tasks.length > 0
      ? tasks.length * itemHeight + Math.max(tasks.length - 1, 0) * this.itemGap
      : 0;

    const contentTransform = this.content.getComponent(UITransform);
    if (contentTransform) {
      contentTransform.setContentSize(contentTransform.width, totalHeight);
    }

    tasks.forEach((task, index) => {
      const item = instantiate(this.taskItemTemplate!);
      item.name = `TaskItem_${task.id}`;
      item.active = true;
      item.parent = this.content!;

      const y = -itemHeight / 2 - index * (itemHeight + this.itemGap);
      item.setPosition(new Vec3(0, y, 0));

      this.renderTaskItem(item, task);
    });
  }

  private renderTaskItem(item: Node, task: TaskModel): void {
    this.setLabel(item, 'TitleLabel', task.title || '每日任务');
    this.setLabel(item, 'ProgressLabel', `进度：${task.progress}/${task.target_value}`);
    this.setLabel(item, 'RewardLabel', `奖励：金币 +${task.reward_coin}  经验 +${task.reward_exp}`);
    this.setProgressBar(item, task);

    const buttonNode = item.getChildByName('ReceiveButton');
    const buttonLabel = buttonNode?.getChildByName('ButtonLabel')?.getComponent(Label);
    const button = buttonNode?.getComponent(Button);

    if (buttonLabel) {
      buttonLabel.string = this.getButtonText(task);
    }

    if (button) {
      // 去完成、领取可点击；已完成不可点击。
      button.interactable = task.status !== 2;
    }

    this.setButtonSprite(buttonNode, task.status);

    if (buttonNode) {
      buttonNode.off(Button.EventType.CLICK);
      buttonNode.on(Button.EventType.CLICK, () => {
        this.playButtonPress(buttonNode, () => {
          if (task.status === 1) {
            void this.receiveTask(task.id);
            return;
          }

          if (task.status === 0) {
            director.loadScene(this.getTaskTargetScene(task));
          }
        });
      }, this);
    }
  }

  private getTaskTargetScene(task: TaskModel): string {
    if (task.task_type === 'sign') return 'Sign';
    return 'Home';
  }

  private setProgressBar(item: Node, task: TaskModel): void {
    const progressBar = item.getChildByName('ProgressBar');
    const barBg = progressBar?.getChildByName('BarBg');
    const barFill = progressBar?.getChildByName('BarFill');

    const bgTransform = barBg?.getComponent(UITransform);
    const fillTransform = barFill?.getComponent(UITransform);

    if (!bgTransform || !fillTransform) return;

    const targetValue = Math.max(Number(task.target_value) || 0, 1);
    const progress = Math.max(0, Math.min(Number(task.progress) || 0, targetValue));
    const percent = progress / targetValue;
    const fillWidth = bgTransform.width * percent;

    fillTransform.setContentSize(fillWidth, fillTransform.height);
  }

  private playButtonPress(buttonNode: Node, callback: () => void): void {
    tween(buttonNode)
      .stop()
      .to(this.pressDuration, { scale: new Vec3(this.pressScale, this.pressScale, 1) })
      .to(this.pressDuration, { scale: Vec3.ONE })
      .call(callback)
      .start();
  }

  private setButtonSprite(buttonNode: Node | undefined, status: number): void {
    if (!buttonNode) return;

    const sprite = buttonNode.getComponent(Sprite);
    if (!sprite) return;

    if (status === 2 && this.taskButtonDoneSprite) {
      sprite.spriteFrame = this.taskButtonDoneSprite;
      return;
    }

    if (this.taskButtonActiveSprite) {
      sprite.spriteFrame = this.taskButtonActiveSprite;
    }
  }

  private async receiveTask(taskId: number): Promise<void> {
    try {
      await this.ensureLogin();
      this.setStatus('领取奖励中...');
      await TaskManager.receive(taskId);
      await UserManager.getInfo();
      this.renderTasks();
      this.setStatus('奖励领取成功');
    } catch (error) {
      console.error(error);
      this.setStatus(error instanceof Error ? error.message : '领取失败');
    }
  }

  private getButtonText(task: TaskModel): string {
    if (task.status === 1) return '领取';
    if (task.status === 2) return '已完成';
    return '去完成';
  }

  private setLabel(root: Node, childName: string, value: string): void {
    const label = root.getChildByName(childName)?.getComponent(Label);
    if (label) {
      label.string = value;
    }
  }

  private setStatus(message: string): void {
    if (this.statusLabel) {
      this.statusLabel.string = message;
    }
  }
}
