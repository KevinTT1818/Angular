import { Pipe, PipeTransform } from '@angular/core';

/**
 * 数字格式化管道 - 友好的数字显示
 * 用法：{{ count | numberFormat }}
 * 
 * 输出示例：
 * - 999 -> 999
 * - 1000 -> 1K
 * - 1500 -> 1.5K
 * - 1000000 -> 1M
 * - 1234567 -> 1.2M
 */
@Pipe({
  name: 'numberFormat',
  standalone: true,
  pure: true
})
export class NumberFormatPipe implements PipeTransform {
  transform(value: number, decimals: number = 1): string {
    if (value === null || value === undefined || isNaN(value)) {
      return '0';
    }
    
    // 小于1000，直接返回
    if (value < 1000) {
      return value.toString();
    }
    
    // 1000 - 999999 (K)
    if (value < 1000000) {
      return this.formatNumber(value / 1000, decimals) + 'K';
    }
    
    // 1000000 - 999999999 (M)
    if (value < 1000000000) {
      return this.formatNumber(value / 1000000, decimals) + 'M';
    }
    
    // 1000000000+ (B)
    return this.formatNumber(value / 1000000000, decimals) + 'B';
  }
  
  /**
   * 格式化数字，保留指定小数位
   */
  private formatNumber(num: number, decimals: number): string {
    const fixed = num.toFixed(decimals);
    // 移除末尾的0
    return parseFloat(fixed).toString();
  }
}