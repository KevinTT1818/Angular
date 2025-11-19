import { Pipe, PipeTransform } from '@angular/core';

/**
 * 截断管道 - 按单词截断文本
 * 用法：{{ text | truncate:50:'...' }}
 */
@Pipe({
  name: 'truncate',
  standalone: true,
  pure: true
})
export class TruncatePipe implements PipeTransform {
  transform(
    value: string, 
    limit: number = 50, 
    trail: string = '...',
    byWords: boolean = false
  ): string {
    if (!value) {
      return '';
    }
    
    if (value.length <= limit) {
      return value;
    }
    
    if (byWords) {
      // 按单词截断
      const words = value.split(/\s+/);
      let truncated = '';
      
      for (const word of words) {
        if ((truncated + word).length > limit) {
          break;
        }
        truncated += word + ' ';
      }
      
      return truncated.trim() + trail;
    } else {
      // 按字符截断
      return value.substring(0, limit).trim() + trail;
    }
  }
}