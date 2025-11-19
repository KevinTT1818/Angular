import { Pipe, PipeTransform } from '@angular/core';

/**
 * 排序管道 - 对数组进行排序
 * 用法：{{ items | sort:'name':'asc' }}
 */
@Pipe({
  name: 'sort',
  standalone: true,
  pure: true
})
export class SortPipe implements PipeTransform {
  transform<T>(
    array: T[], 
    field: keyof T, 
    order: 'asc' | 'desc' = 'asc'
  ): T[] {
    if (!array || !Array.isArray(array) || array.length === 0) {
      return array;
    }
    
    const sorted = [...array].sort((a, b) => {
      const aValue = a[field];
      const bValue = b[field];
      
      // 处理null/undefined
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      // 字符串比较
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return order === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      // 数字比较
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return order === 'asc' 
          ? aValue - bValue
          : bValue - aValue;
      }
      
      // 日期比较
      if (aValue instanceof Date && bValue instanceof Date) {
        return order === 'asc'
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }
      
      return 0;
    });
    
    return sorted;
  }
}