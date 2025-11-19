import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * 高亮搜索管道 - 高亮显示搜索关键词
 * 用法：<div [innerHTML]="text | highlight:searchTerm"></div>
 */
@Pipe({
  name: 'highlight',
  standalone: true,
  pure: true
})
export class HighlightPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  
  transform(value: string, search: string, className: string = 'highlight'): SafeHtml {
    if (!value || !search) {
      return value;
    }
    
    // 转义特殊字符
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // 创建正则表达式（不区分大小写）
    const regex = new RegExp(escapedSearch, 'gi');
    
    // 替换匹配的文本
    const highlighted = value.replace(regex, (match) => {
      return `<span class="${className}">${match}</span>`;
    });
    
    return this.sanitizer.sanitize(1, highlighted) || value;
  }
}