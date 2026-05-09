import { Http } from '../core/Http';
import { PetModel } from '../model/PetModel';
import { UserManager } from './UserManager';

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

  static async feed(): Promise<PetModel> {
    return this.action('/api/pet/feed');
  }

  static async bath(): Promise<PetModel> {
    return this.action('/api/pet/bath');
  }

  static async play(): Promise<PetModel> {
    return this.action('/api/pet/play');
  }

  private static async action(url: string): Promise<PetModel> {
    const res = await Http.post<{
      user: any;
      pet: PetModel;
    }>(url);

    if (res.code !== 0) {
      throw new Error(res.message || '宠物操作失败');
    }

    this.pet = this.normalizePet(res.data.pet);

    if (res.data.user) {
      UserManager.updateUser(res.data.user);
    }

    return this.pet;
  }
}
