export interface UserModel {
  id: number;
  nickname: string;
  level: number;
  exp: number;
  coin: number;
  diamond: number;
  token?: string;
}
