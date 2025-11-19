import { Component, output, input, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlogService } from '../../../core/services/blog.service';
import { Category } from '../../../core/models/blog/blog-module';

export interface FilterOptions {
  categoryId?: string;
  tags?: string[];
  sortBy?: 'latest' | 'popular' | 'title';
}

@Component({
  selector: 'app-blog-filter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './blog-filter.html',
  styleUrl: './blog-filter.scss'
})
export class BlogFilter implements OnInit {
  private blogService = inject(BlogService);

  // Inputs
  selectedCategoryId = input<string | undefined>();
  selectedTags = input<string[]>([]);
  selectedSort = input<'latest' | 'popular' | 'title'>('latest');

  // Outputs
  filterChange = output<FilterOptions>();
  clearFilters = output<void>();

  // State
  categories = signal<Category[]>([]);
  availableTags = signal<string[]>([
    'Angular',
    'TypeScript',
    'JavaScript',
    'CSS',
    'HTML',
    'RxJS',
    'Node.js',
    'React',
    'Vue',
    'Web开发',
    '前端',
    '后端',
    '全栈',
    '性能优化',
    '最佳实践',
    '教程',
    '案例研究'
  ]);

  currentCategoryId = signal<string | undefined>(undefined);
  currentTags = signal<string[]>([]);
  currentSort = signal<'latest' | 'popular' | 'title'>('latest');

  isExpanded = signal(false);

  ngOnInit(): void {
    // 加载分类
    this.blogService.getCategories().subscribe({
      next: (categories: Category[]) => {
        this.categories.set(categories);
      },
      error: (error: any) => {
        console.error('加载分类失败:', error);
      }
    });

    // 设置初始值
    this.currentCategoryId.set(this.selectedCategoryId());
    this.currentTags.set(this.selectedTags());
    this.currentSort.set(this.selectedSort());
  }

  /**
   * 选择分类
   */
  selectCategory(categoryId: string | undefined): void {
    this.currentCategoryId.set(categoryId);
    this.emitFilterChange();
  }

  /**
   * 切换标签选择
   */
  toggleTag(tag: string): void {
    const tags = this.currentTags();
    const index = tags.indexOf(tag);

    if (index > -1) {
      // 移除标签
      this.currentTags.set(tags.filter(t => t !== tag));
    } else {
      // 添加标签
      this.currentTags.set([...tags, tag]);
    }

    this.emitFilterChange();
  }

  /**
   * 检查标签是否被选中
   */
  isTagSelected(tag: string): boolean {
    return this.currentTags().includes(tag);
  }

  /**
   * 改变排序方式
   */
  changeSort(sortBy: 'latest' | 'popular' | 'title'): void {
    this.currentSort.set(sortBy);
    this.emitFilterChange();
  }

  /**
   * 清除所有筛选
   */
  onClearFilters(): void {
    this.currentCategoryId.set(undefined);
    this.currentTags.set([]);
    this.currentSort.set('latest');
    this.clearFilters.emit();
    this.emitFilterChange();
  }

  /**
   * 发出筛选变更事件
   */
  private emitFilterChange(): void {
    const filters: FilterOptions = {
      categoryId: this.currentCategoryId(),
      tags: this.currentTags(),
      sortBy: this.currentSort()
    };
    this.filterChange.emit(filters);
  }

  /**
   * 切换筛选器展开状态
   */
  toggleExpand(): void {
    this.isExpanded.update(expanded => !expanded);
  }

  /**
   * 检查是否有激活的筛选器
   */
  hasActiveFilters(): boolean {
    return !!this.currentCategoryId() || this.currentTags().length > 0 || this.currentSort() !== 'latest';
  }

  /**
   * 获取激活的筛选器数量
   */
  getActiveFilterCount(): number {
    let count = 0;
    if (this.currentCategoryId()) count++;
    count += this.currentTags().length;
    if (this.currentSort() !== 'latest') count++;
    return count;
  }
}
