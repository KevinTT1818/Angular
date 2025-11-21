import { Injectable } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface UploadResult {
  url: string;
  fileName: string;
  size: number;
  width?: number;
  height?: number;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

@Injectable({
  providedIn: 'root'
})
export class ImageUploadService {
  // 配置项
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  private readonly MAX_WIDTH = 1920;
  private readonly MAX_HEIGHT = 1080;

  constructor() {}

  /**
   * 验证图片文件
   */
  validateImage(file: File): { valid: boolean; error?: string } {
    // 检查文件类型
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: '不支持的文件格式。请上传 JPG、PNG、GIF 或 WebP 格式的图片'
      };
    }

    // 检查文件大小
    if (file.size > this.MAX_FILE_SIZE) {
      const sizeMB = (this.MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
      return {
        valid: false,
        error: `文件大小超过限制。最大支持 ${sizeMB}MB`
      };
    }

    return { valid: true };
  }

  /**
   * 压缩图片
   */
  private compressImage(file: File, maxWidth: number = this.MAX_WIDTH, maxHeight: number = this.MAX_HEIGHT): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        const img = new Image();

        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // 计算缩放比例
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('无法创建canvas上下文'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('图片压缩失败'));
              }
            },
            file.type,
            0.9 // 质量
          );
        };

        img.onerror = () => reject(new Error('图片加载失败'));
        img.src = e.target.result;
      };

      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * 获取图片尺寸
   */
  private getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.width, height: img.height });
        img.onerror = () => reject(new Error('无法读取图片尺寸'));
        img.src = e.target.result;
      };

      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * 上传图片 - 使用本地存储（模拟上传）
   * 在生产环境中，这里应该调用真实的API
   */
  uploadImage(file: File): Observable<UploadResult> {
    // 验证文件
    const validation = this.validateImage(file);
    if (!validation.valid) {
      return throwError(() => new Error(validation.error));
    }

    return from(this.processAndUpload(file)).pipe(
      catchError(error => throwError(() => error))
    );
  }

  /**
   * 处理并上传图片
   */
  private async processAndUpload(file: File): Promise<UploadResult> {
    try {
      // 获取图片尺寸
      const dimensions = await this.getImageDimensions(file);

      // 压缩图片
      const compressedBlob = await this.compressImage(file);

      // 生成唯一文件名
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const extension = file.name.split('.').pop() || 'jpg';
      const fileName = `image_${timestamp}_${randomStr}.${extension}`;

      // 根据配置选择上传方式
      if (environment.useMockData) {
        // Mock模式：使用localStorage
        const base64 = await this.blobToBase64(compressedBlob);
        const storageKey = `blog_image_${fileName}`;
        localStorage.setItem(storageKey, base64);

        return {
          url: base64,
          fileName: fileName,
          size: compressedBlob.size,
          width: dimensions.width,
          height: dimensions.height
        };
      } else {
        // 真实API模式：上传到服务器
        return await this.uploadToAPI(compressedBlob, fileName);
      }
    } catch (error: any) {
      throw new Error(`图片上传失败: ${error.message}`);
    }
  }

  /**
   * 上传图片到真实API
   * 设置 environment.useMockData = false 来启用
   */
  private async uploadToAPI(blob: Blob, fileName: string): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('file', blob, fileName);

    const url = `${environment.apiUrl}${environment.endpoints.uploadImage}`;

    // 如果启用了认证，从localStorage获取token
    const headers: HeadersInit = {};
    if (environment.enableAuth) {
      const token = localStorage.getItem('access_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: '上传失败' }));
      // 后端返回的错误信息可能在 message 或 error 字段中
      const errorMsg = error.message || error.error || `上传失败 (${response.status})`;
      throw new Error(errorMsg);
    }

    const data = await response.json();

    // 适配后端响应格式 (NestJS 直接返回对象，不包装在 data 字段中)
    return {
      url: data.url || data.data?.url,
      fileName: data.filename || data.fileName || data.data?.fileName || fileName,
      size: data.size || blob.size,
      width: data.width || data.data?.width,
      height: data.height || data.data?.height
    };
  }

  /**
   * Blob转Base64
   */
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * 批量上传图片
   */
  uploadMultiple(files: File[]): Observable<UploadResult[]> {
    const uploadPromises = files.map(file =>
      new Promise<UploadResult>((resolve, reject) => {
        this.uploadImage(file).subscribe({
          next: (result) => resolve(result),
          error: (error) => reject(error)
        });
      })
    );
    return from(Promise.all(uploadPromises));
  }

  /**
   * 删除图片（从localStorage）
   */
  deleteImage(fileName: string): boolean {
    try {
      const storageKey = `blog_image_${fileName}`;
      localStorage.removeItem(storageKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 创建预览URL
   */
  createPreviewUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: any) => resolve(e.target.result);
      reader.onerror = () => reject(new Error('预览生成失败'));
      reader.readAsDataURL(file);
    });
  }
}
