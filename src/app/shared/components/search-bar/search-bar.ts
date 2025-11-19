import { Component, output, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.scss'
})
export class SearchBar {
  // Inputs
  placeholder = input<string>('搜索博客...');
  initialValue = input<string>('');

  // Outputs
  search = output<string>();
  clear = output<void>();

  // State
  searchQuery = signal<string>('');
  isExpanded = signal<boolean>(false);

  constructor() {
    // 设置初始值
    const initial = this.initialValue();
    if (initial) {
      this.searchQuery.set(initial);
      this.isExpanded.set(true);
    }
  }

  /**
   * 处理搜索
   */
  onSearch(): void {
    const query = this.searchQuery().trim();
    if (query) {
      this.search.emit(query);
      this.isExpanded.set(true);
    }
  }

  /**
   * 处理键盘事件
   */
  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onSearch();
    }
  }

  /**
   * 清除搜索
   */
  onClear(): void {
    this.searchQuery.set('');
    this.isExpanded.set(false);
    this.clear.emit();
  }

  /**
   * 切换展开状态
   */
  toggleExpand(): void {
    if (!this.isExpanded()) {
      this.isExpanded.set(true);
    }
  }
}
