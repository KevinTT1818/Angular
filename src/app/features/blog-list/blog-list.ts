import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { BlogService } from '../../core/services/blog.service';
import { SeoService } from '../../core/services/seo.service';
import { Blog, Category } from '../../core/models/blog/blog-module';
import { ExcerptPipe } from '../../shared/pipes/excerpt-pipe';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ExcerptPipe
  ],
  templateUrl: './blog-list.html',
  styleUrls: ['./blog-list.scss']
})
export class BlogListComponent implements OnInit {
  private blogService = inject(BlogService);
  private seoService = inject(SeoService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  
  // Signals
  blogs = signal<Blog[]>([]);
  categories = signal<Category[]>([]);
  popularBlogs = signal<Blog[]>([]);
  isLoading = signal(false);
  totalBlogs = signal(0);
  currentPage = signal(1);
  pageSize = signal(10);

  // 筛选状态
  searchQuery = signal<string>('');
  selectedCategory = signal<string | undefined>(undefined);
  selectedTags = signal<string[]>([]);
  sortBy = signal<'latest' | 'popular' | 'title'>('latest');
  showAdvancedFilters = signal<boolean>(false);

  // 可用标签
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
    '最佳实践'
  ]);
  
  // 计算属性
  totalPages = computed(() => 
    Math.ceil(this.totalBlogs() / this.pageSize())
  );
  
  pages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    
    // 显示当前页前后2页
    for (let i = Math.max(1, current - 2); i <= Math.min(total, current + 2); i++) {
      pages.push(i);
    }
    
    return pages;
  });
  
  hasBlogs = computed(() => this.blogs().length > 0);
  
  ngOnInit(): void {
    // 设置SEO
    this.seoService.updateMetaTags({
      title: '博客列表',
      description: '浏览所有技术博客文章，分享编程知识和开发经验',
      keywords: ['博客', '技术文章', 'Angular', 'TypeScript', 'Web开发']
    });

    // 获取URL参数
    this.route.queryParams.subscribe(params => {
      if (params['search']) {
        this.searchQuery.set(params['search']);
      }
      if (params['category']) {
        this.selectedCategory.set(params['category']);
      }
      if (params['tags']) {
        const tags = params['tags'].split(',').filter((t: string) => t.trim());
        this.selectedTags.set(tags);
      }
      if (params['sort']) {
        this.sortBy.set(params['sort'] as 'latest' | 'popular' | 'title');
      }
      if (params['page']) {
        this.currentPage.set(+params['page']);
      }

      this.loadBlogs();
    });

    // 加载分类
    this.blogService.getCategories().subscribe(
      categories => this.categories.set(categories)
    );

    // 加载热门博客
    this.blogService.getPopularBlogs(5).subscribe(
      blogs => this.popularBlogs.set(blogs)
    );
  }
  
  /**
   * 加载博客列表
   */
  loadBlogs(): void {
    this.isLoading.set(true);

    const query = this.searchQuery().trim();

    // 如果有搜索关键词，使用搜索API
    if (query) {
      this.blogService.searchBlogs(query).subscribe({
        next: (blogs) => {
          let filteredBlogs = blogs;

          // 应用分类筛选
          if (this.selectedCategory()) {
            filteredBlogs = filteredBlogs.filter(b => b.categoryId === this.selectedCategory());
          }

          // 应用标签筛选
          const tags = this.selectedTags();
          if (tags.length > 0) {
            filteredBlogs = filteredBlogs.filter(b =>
              tags.some(tag => b.tags.includes(tag))
            );
          }

          // 应用排序
          filteredBlogs = this.sortBlogs(filteredBlogs);

          this.blogs.set(filteredBlogs);
          this.totalBlogs.set(filteredBlogs.length);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('搜索失败:', error);
          this.isLoading.set(false);
        }
      });
    } else {
      // 正常加载博客列表
      const params = {
        page: this.currentPage(),
        limit: this.pageSize(),
        categoryId: this.selectedCategory() || undefined,
        tags: this.selectedTags().length > 0 ? this.selectedTags().join(',') : undefined,
        sort: this.sortBy()
      };

      this.blogService.getBlogs(params).subscribe({
        next: (response) => {
          const sortedBlogs = this.sortBlogs(response.blogs);
          this.blogs.set(sortedBlogs);
          this.totalBlogs.set(response.total);
          this.isLoading.set(false);

          // 滚动到顶部
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        error: (error) => {
          console.error('加载博客失败:', error);
          this.isLoading.set(false);
        }
      });
    }
  }

  /**
   * 排序博客
   */
  private sortBlogs(blogs: Blog[]): Blog[] {
    const sorted = [...blogs];
    const sortType = this.sortBy();

    switch (sortType) {
      case 'latest':
        return sorted.sort((a, b) =>
          new Date(b.publishedAt || b.createdAt).getTime() -
          new Date(a.publishedAt || a.createdAt).getTime()
        );
      case 'popular':
        return sorted.sort((a, b) => b.viewCount - a.viewCount);
      case 'title':
        return sorted.sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'));
      default:
        return sorted;
    }
  }
  
  /**
   * 处理搜索
   */
  onSearch(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1);
    this.updateUrlParams();
  }

  /**
   * 清除搜索
   */
  onClearSearch(): void {
    this.searchQuery.set('');
    this.currentPage.set(1);
    this.updateUrlParams();
  }


  /**
   * 切换分类
   */
  selectCategory(categoryId: string | undefined): void {
    this.selectedCategory.set(categoryId);
    this.selectedTags.set([]);
    this.currentPage.set(1);
    this.updateUrlParams();
  }

  /**
   * 选择标签
   */
  selectTag(tag: string): void {
    const tags = this.selectedTags();
    if (tags.includes(tag)) {
      this.selectedTags.set(tags.filter(t => t !== tag));
    } else {
      this.selectedTags.set([...tags, tag]);
    }
    this.currentPage.set(1);
    this.updateUrlParams();
  }
  
  /**
   * 切换页码
   */
  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;

    this.currentPage.set(page);
    this.updateUrlParams();
  }

  /**
   * 清除所有筛选
   */
  clearFilters(): void {
    this.searchQuery.set('');
    this.selectedCategory.set(undefined);
    this.selectedTags.set([]);
    this.sortBy.set('latest');
    this.currentPage.set(1);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {}
    });
  }

  /**
   * 更新URL参数（公开方法，供模板调用）
   */
  updateUrlParams(): void {
    const queryParams: any = {};

    if (this.searchQuery()) {
      queryParams.search = this.searchQuery();
    }
    if (this.selectedCategory()) {
      queryParams.category = this.selectedCategory();
    }
    if (this.selectedTags().length > 0) {
      queryParams.tags = this.selectedTags().join(',');
    }
    if (this.sortBy() !== 'latest') {
      queryParams.sort = this.sortBy();
    }
    if (this.currentPage() > 1) {
      queryParams.page = this.currentPage();
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      replaceUrl: true
    });
  }
  
  /**
   * 查看博客详情
   */
  viewBlog(blogId: string): void {
    this.router.navigate(['/blog', blogId]);
  }
  
  /**
   * 获取分类名称
   */
  getCategoryName(categoryId: string): string {
    const category = this.categories().find(c => c.id === categoryId);
    return category?.name || '未分类';
  }
  
  /**
   * 获取所有标签（去重）
   */
  getAllTags(): string[] {
    const tags = new Set<string>();
    this.blogs().forEach(blog => {
      blog.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  }

  /**
   * 检查是否有激活的筛选器
   */
  hasActiveFilters(): boolean {
    return !!this.searchQuery() ||
           !!this.selectedCategory() ||
           this.selectedTags().length > 0 ||
           this.sortBy() !== 'latest';
  }

  /**
   * 排序变更
   */
  onSortChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as 'latest' | 'popular' | 'title';
    this.sortBy.set(value);
    this.currentPage.set(1);
    this.updateUrlParams();
  }

  /**
   * 分类变更
   */
  onCategoryChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedCategory.set(value || undefined);
    this.currentPage.set(1);
    this.updateUrlParams();
  }

  /**
   * 切换高级筛选面板
   */
  toggleAdvancedFilters(): void {
    this.showAdvancedFilters.update(show => !show);
  }

  /**
   * 图片加载错误处理 - 使用默认占位图
   */
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    // 使用渐变色占位图
    img.src = 'data:image/svg+xml;base64,' + btoa(`
      <svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="800" height="400" fill="url(#grad)"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24"
              fill="white" text-anchor="middle" dominant-baseline="middle" opacity="0.8">
          📝 博客封面图片
        </text>
      </svg>
    `);
  }
}