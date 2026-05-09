import { Http } from '../core/Http';
import { UserManager } from './UserManager';

export interface TaskModel {
  id: number;
  title: string;
  task_type: string;
  target_value: number;
  progress: number;
  reward_coin: number;
  reward_exp: number;
  status: number;
}

export class TaskManager {
  static tasks: TaskModel[] = [];

  static async list(): Promise<TaskModel[]> {
    const res = await Http.get<{
      tasks: TaskModel[];
    }>('/api/task/list');

    if (res.code !== 0) {
      throw new Error(res.message || '获取任务失败');
    }

    this.tasks = res.data.tasks || [];
    return this.tasks;
  }

  static async receive(taskId: number): Promise<TaskModel[]> {
    const res = await Http.post<{
      reward_coin: number;
      tasks: TaskModel[];
      user?: any;
    }>('/api/task/receive', {
      task_id: taskId,
    });

    if (res.code !== 0) {
      throw new Error(res.message || '领取任务奖励失败');
    }

    this.tasks = res.data.tasks || [];

    if (res.data.user) {
      UserManager.updateUser(res.data.user);
    }

    return this.tasks;
  }
}
