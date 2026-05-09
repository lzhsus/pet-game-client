import { ApiConfig } from './ApiConfig';

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

export class Http {
  static get<T = any>(url: string): Promise<ApiResponse<T>> {
    return this.request<T>('GET', url);
  }

  static post<T = any>(url: string, data: Record<string, any> = {}): Promise<ApiResponse<T>> {
    return this.request<T>('POST', url, data);
  }

  private static request<T = any>(method: string, url: string, data?: Record<string, any>): Promise<ApiResponse<T>> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(method, ApiConfig.baseUrl + url, true);
      xhr.setRequestHeader('Content-Type', 'application/json');

      if (ApiConfig.token) {
        xhr.setRequestHeader('Authorization', `Bearer ${ApiConfig.token}`);
      }

      xhr.onreadystatechange = () => {
        if (xhr.readyState !== 4) return;

        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch (error) {
            reject(new Error('接口返回不是 JSON'));
          }
          return;
        }

        reject(new Error(`HTTP 请求失败：${xhr.status}`));
      };

      xhr.onerror = () => reject(new Error('网络错误，请确认 PHP 服务已启动'));
      xhr.send(data ? JSON.stringify(data) : null);
    });
  }
}
