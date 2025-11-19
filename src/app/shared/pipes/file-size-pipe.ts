import { Pipe, PipeTransform } from '@angular/core';

/**
 * 文件大小管道 - 格式化字节大小
 * 用法：{{ fileSize | fileSize }}
 * 
 * 输出示例：
 * - 1024 -> 1 KB
 * - 1048576 -> 1 MB
 * - 1073741824 -> 1 GB
 */
@Pipe({
  name: 'fileSize',
  standalone: true,
  pure: true
})
export class FileSizePipe implements PipeTransform {
  private units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  
  transform(bytes: number, precision: number = 2): string {
    if (bytes === 0 || bytes === null || bytes === undefined) {
      return '0 B';
    }
    
    if (bytes < 0) {
      return 'Invalid size';
    }
    
    const unitIndex = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = bytes / Math.pow(1024, unitIndex);
    
    return `${size.toFixed(precision)} ${this.units[unitIndex]}`;
  }
}