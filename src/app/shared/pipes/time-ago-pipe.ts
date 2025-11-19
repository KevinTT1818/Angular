import { Pipe, PipeTransform } from '@angular/core';

/**
 * 时间差管道 - 显示相对时间（更详细版本）
 * 用法：{{ date | timeAgo }}
 */
@Pipe({
  name: 'timeAgo',
  standalone: true,
  pure: false  // 不是纯管道，因为时间会变化
})
export class TimeAgoPipe implements PipeTransform {
  transform(value: Date | string | number): string {
    if (!value) {
      return '';
    }
    
    const date = new Date(value);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 0) {
      return '未来';
    }
    
    const intervals = {
      年: 31536000,
      个月: 2592000,
      周: 604800,
      天: 86400,
      小时: 3600,
      分钟: 60,
      秒: 1
    };
    
    for (const [name, secondsInInterval] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInInterval);
      
      if (interval >= 1) {
        return `${interval}${name}前`;
      }
    }
    
    return '刚刚';
  }
}