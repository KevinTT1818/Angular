import { Pipe, PipeTransform } from '@angular/core';

/**
 * 摘要管道 - 截取指定长度的文本并添加省略号
 * 用法：{{ text | excerpt:100 }}
 */
@Pipe({
  name: 'excerpt',
  standalone: true,
  pure: true
})
export class ExcerptPipe implements PipeTransform {
  transform(value: string, length: number = 100, suffix: string = '...'): string {
    if (!value) {
      return '';
    }
    
    // 移除HTML标签
    const plainText = value.replace(/<[^>]*>/g, '');
    
    // 如果文本长度小于指定长度，直接返回
    if (plainText.length <= length) {
      return plainText;
    }
    
    // 截取指定长度并添加后缀
    return plainText.substring(0, length).trim() + suffix;
  }
}