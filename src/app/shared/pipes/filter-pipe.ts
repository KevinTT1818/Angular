import { Pipe, PipeTransform } from '@angular/core';

/**
 * 过滤管道 - 根据条件过滤数组
 * 用法：{{ items | filter:searchTerm:'name' }}
 */
@Pipe({
  name: 'filter',
  standalone: true,
  pure: true
})
export class FilterPipe implements PipeTransform {
  transform<T extends Record<string, any>>(
    array: T[],
    searchText: string,
    fields?: (keyof T)[]
  ): T[] {
    if (!array || !Array.isArray(array) || !searchText) {
      return array;
    }
    
    const lowerSearchText = searchText.toLowerCase();
    
    return array.filter(item => {
      // 如果指定了字段，只在这些字段中搜索
      if (fields && fields.length > 0) {
        return fields.some(field => {
          const value = item[field];
          if (value === null || value === undefined) return false;
          return String(value).toLowerCase().includes(lowerSearchText);
        });
      }
      
      // 否则在所有字段中搜索
      return Object.values(item).some(value => {
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(lowerSearchText);
      });
    });
  }
}