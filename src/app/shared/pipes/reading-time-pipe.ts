import { Pipe, PipeTransform } from '@angular/core';

/**
 * 阅读时间管道 - 估算文章阅读时间
 * 用法：{{ content | readingTime }}
 * 
 * 假设每分钟阅读300字
 */
@Pipe({
  name: 'readingTime',
  standalone: true,
  pure: true
})
export class ReadingTimePipe implements PipeTransform {
  private readonly WORDS_PER_MINUTE = 300;
  
  transform(value: string, wordsPerMinute: number = this.WORDS_PER_MINUTE): string {
    if (!value) {
      return '0 分钟';
    }
    
    // 移除HTML标签和Markdown语法
    const plainText = value
      .replace(/<[^>]*>/g, '')
      .replace(/[#*`>\-\[\]]/g, '')
      .replace(/!\[.*?\]\(.*?\)/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '');
    
    // 计算字数（中文字符 + 英文单词）
    const chineseChars = (plainText.match(/[\u4e00-\u9fa5]/g) || []).length;
    const englishWords = plainText
      .replace(/[\u4e00-\u9fa5]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 0).length;
    
    const totalWords = chineseChars + englishWords;
    
    // 计算阅读时间（分钟）
    const minutes = Math.ceil(totalWords / wordsPerMinute);
    
    if (minutes < 1) {
      return '不到 1 分钟';
    }
    
    if (minutes === 1) {
      return '1 分钟';
    }
    
    return `${minutes} 分钟`;
  }
}