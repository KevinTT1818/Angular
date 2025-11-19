import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * 安全HTML管道 - 信任HTML内容
 * 用法：<div [innerHTML]="htmlContent | safeHtml"></div>
 * 
 * 注意：仅对可信内容使用此管道
 */
@Pipe({
  name: 'safeHtml',
  standalone: true,
  pure: true
})
export class SafeHtmlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  
  transform(value: string): SafeHtml {
    if (!value) {
      return '';
    }
    
    return this.sanitizer.sanitize(1, value) || '';
  }
}