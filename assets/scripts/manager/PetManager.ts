import { Http } from '../core/Http';
import { PetModel } from '../model/PetModel';
import { UserManager } from './UserManager';

export interface PetActionResult {
  pet: PetModel;
  message: string;
  used_item?: {
    id: number;
    name: string;
    type: string;
    hunger_value: number;
    clean_value: number;
    mood_value: number;
    exp_value: number;
  };
}

export class PetManager {
  static pet: PetModel | null = null;

  static normalizePet(pet: any): PetModel {
    return {
      ...pet,
      clean: pet.clean_value ?? pet.clean ?? 0,
    } as PetModel;
  }

  static async getInfo(): Promise<PetModel> {
    const res = await Http.get<{
      pet: PetModel;
    }>('/api/pet/profile');

    if (res.code !== 0) {
      throw new Error(res.message || '获取宠物失败');
    }

    this.pet = this.normalizePet(res.data.pet);

    return this.pet;
  }

  static async feed(): Promise<PetActionResult> {
    return this.action('/api/pet/feed');
  }

  static async bath(): Promise<PetActionResult> {
    return this.action('/api/pet/bath');
  }

  static async play(): Promise<PetActionResult> {
    return this.action('/api/pet/play');
  }

  private static async action(url: string): Promise<PetActionResult> {
    const res = await Http.post<{
      user: any;
      pet: any;
    }>(url);

    if (res.code !== 0) {
      throw new Error(res.message || '宠物操作失败');
    }

    this.pet = this.normalizePet(res.data.pet);

    if (res.data.user) {
      UserManager.updateUser(res.data.user);
    }

    return {
      pet: this.pet,
      message: res.data.pet?.message || '操作成功',
      used_item: res.data.pet?.used_item,
    };
  }
}
