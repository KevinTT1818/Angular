import { Pipe, PipeTransform } from '@angular/core';

/**
 * 日期格式化管道 - 友好的日期显示
 * 用法：{{ date | dateFormat }}
 * 
 * 输出示例：
 * - 刚刚
 * - 5分钟前
 * - 2小时前
 * - 昨天 14:30
 * - 3天前
 * - 2024-01-15
 */
@Pipe({
  name: 'dateFormat',
  standalone: true,
  pure: true
})
export class DateFormatPipe implements PipeTransform {
  transform(value: Date | string | number, format: 'relative' | 'full' | 'short' = 'relative'): string {
    if (!value) {
      return '';
    }
    
    const date = new Date(value);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // 如果是full格式，返回完整日期时间
    if (format === 'full') {
      return this.formatFullDate(date);
    }
    
    // 如果是short格式，返回简短日期
    if (format === 'short') {
      return this.formatShortDate(date);
    }
    
    // 相对时间格式
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    // 刚刚（1分钟内）
    if (seconds < 60) {
      return '刚刚';
    }
    
    // X分钟前（1小时内）
    if (minutes < 60) {
      return `${minutes}分钟前`;
    }
    
    // X小时前（24小时内）
    if (hours < 24) {
      return `${hours}小时前`;
    }
    
    // 昨天（1-2天）
    if (days === 1) {
      return `昨天 ${this.formatTime(date)}`;
    }
    
    // X天前（7天内）
    if (days < 7) {
      return `${days}天前`;
    }
    
    // 超过7天，显示日期
    return this.formatShortDate(date);
  }
  
  /**
   * 格式化完整日期时间
   * 格式：2024-01-15 14:30:00
   */
  private formatFullDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
  
  /**
   * 格式化短日期
   * 格式：2024-01-15
   */
  private formatShortDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }
  
  /**
   * 格式化时间
   * 格式：14:30
   */
  private formatTime(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${hours}:${minutes}`;
  }
}