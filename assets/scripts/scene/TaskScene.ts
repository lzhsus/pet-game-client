import { _decorator, Component, Label, Node, Button } from 'cc';
import { TaskManager, TaskModel } from '../manager/TaskManager';
import { UserManager } from '../manager/UserManager';

const { ccclass, property } = _decorator;

@ccclass('TaskScene')
export class TaskScene extends Component {
  @property([Node])
  taskItems: Node[] = [];

  @property(Label)
  statusLabel: Label | null = null;

  protected async start(): Promise<void> {
    await this.loadTasks();
  }

  public async onClickRefresh(): Promise<void> {
    await this.loadTasks();
  }

  private async loadTasks(): Promise<void> {
    try {
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
    const tasks = TaskManager.tasks;

    this.taskItems.forEach((item, index) => {
      const task = tasks[index];
      item.active = !!task;

      if (!task) return;

      this.renderTaskItem(item, task);
    });
  }

  private renderTaskItem(item: Node, task: TaskModel): void {
    this.setLabel(item, 'TitleLabel', task.title || '每日任务');
    this.setLabel(item, 'ProgressLabel', `进度：${task.progress}/${task.target_value}`);
    this.setLabel(item, 'RewardLabel', `奖励：金币 +${task.reward_coin}  经验 +${task.reward_exp}`);

    const buttonNode = item.getChildByName('ReceiveButton');
    const buttonLabel = buttonNode?.getChildByName('ButtonLabel')?.getComponent(Label);
    const button = buttonNode?.getComponent(Button);

    if (buttonLabel) {
      buttonLabel.string = this.getButtonText(task);
    }

    if (button) {
      button.interactable = task.status === 1;
    }

    if (buttonNode) {
      buttonNode.off(Button.EventType.CLICK);
      buttonNode.on(Button.EventType.CLICK, () => {
        void this.receiveTask(task.id);
      }, this);
    }
  }

  private async receiveTask(taskId: number): Promise<void> {
    try {
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
    if (task.status === 2) return '已领取';
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
