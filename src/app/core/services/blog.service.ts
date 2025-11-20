import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, retry, tap, map } from 'rxjs/operators';
import { Blog, Category } from '../models/blog/blog-module';
import { MockDataService } from './mock-data';
import { environment } from '../../../environments/environment';

/**
 * API响应接口
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private http = inject(HttpClient);
  private mockDataService = inject(MockDataService);

  // API基础URL
  private get apiUrl(): string {
    return environment.apiUrl;
  }

  // 根据环境变量决定使用Mock数据还是真实API
  private get useMock(): boolean {
    return environment.useMockData;
  }

  // Signals
  blogs = signal<Blog[]>([]);
  categories = signal<Category[]>([]);
  currentBlog = signal<Blog | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);

  /**
   * 构建完整的API URL
   */
  private buildUrl(endpoint: string, params?: { [key: string]: string }): string {
    let url = `${this.apiUrl}${endpoint}`;

    // 替换URL参数 (例如: /blogs/:id => /blogs/123)
    if (params) {
      Object.keys(params).forEach(key => {
        url = url.replace(`:${key}`, params[key]);
      });
    }

    return url;
  }

  /**
   * 构建查询参数
   */
  private buildParams(params?: any): HttpParams {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }

    return httpParams;
  }

  /**
   * 错误处理
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = '发生未知错误';

    if (error.error instanceof ErrorEvent) {
      // 客户端错误
      errorMessage = `错误: ${error.error.message}`;
    } else {
      // 服务器错误
      errorMessage = error.error?.message ||
                    error.error?.error ||
                    `服务器错误 (${error.status}): ${error.message}`;
    }

    this.error.set(errorMessage);
    console.error('API错误:', error);

    return throwError(() => new Error(errorMessage));
  }

  /**
   * 获取博客列表
   */
  getBlogs(params?: {
    page?: number;
    limit?: number;
    categoryId?: string;
    tags?: string;
    search?: string;
    sort?: string;
  }): Observable<{ blogs: Blog[]; total: number }> {
    if (this.useMock) {
      return this.mockDataService.getBlogs(params);
    }

    const url = this.buildUrl(environment.endpoints.blogs);
    const httpParams = this.buildParams(params);

    this.isLoading.set(true);

    // 后端直接返回 { blogs, total, page, limit, totalPages }
    return this.http.get<{ blogs: Blog[]; total: number; page: number; limit: number; totalPages: number }>(url, { params: httpParams }).pipe(
      retry(environment.retryAttempts),
      map(response => ({
        blogs: response.blogs,
        total: response.total
      })),
      tap(() => this.isLoading.set(false)),
      catchError(error => {
        this.isLoading.set(false);
        return this.handleError(error);
      })
    );
  }

  /**
   * 获取博客详情
   */
  getBlogById(id: string): Observable<Blog> {
    if (this.useMock) {
      return this.mockDataService.getBlogById(id);
    }

    const url = this.buildUrl(environment.endpoints.blogDetail, { id });
    this.isLoading.set(true);

    // 后端直接返回 Blog 对象
    return this.http.get<Blog>(url).pipe(
      retry(environment.retryAttempts),
      tap(blog => {
        this.currentBlog.set(blog);
        this.isLoading.set(false);
      }),
      catchError(error => {
        this.isLoading.set(false);
        return this.handleError(error);
      })
    );
  }

  /**
   * 创建博客
   */
  createBlog(blog: Partial<Blog>): Observable<Blog> {
    if (this.useMock) {
      return this.mockDataService.createBlog(blog);
    }

    const url = this.buildUrl(environment.endpoints.createBlog);
    this.isLoading.set(true);

    // 后端直接返回 Blog 对象
    return this.http.post<Blog>(url, blog).pipe(
      tap(() => this.isLoading.set(false)),
      catchError(error => {
        this.isLoading.set(false);
        return this.handleError(error);
      })
    );
  }

  /**
   * 更新博客
   */
  updateBlog(id: string, blog: Partial<Blog>): Observable<Blog> {
    if (this.useMock) {
      return this.mockDataService.updateBlog(id, blog);
    }

    const url = this.buildUrl(environment.endpoints.updateBlog, { id });
    this.isLoading.set(true);

    // 后端使用 PATCH 而不是 PUT，并直接返回 Blog 对象
    return this.http.patch<Blog>(url, blog).pipe(
      tap(() => this.isLoading.set(false)),
      catchError(error => {
        this.isLoading.set(false);
        return this.handleError(error);
      })
    );
  }

  /**
   * 删除博客
   */
  deleteBlog(id: string): Observable<void> {
    if (this.useMock) {
      return this.mockDataService.deleteBlog(id);
    }

    const url = this.buildUrl(environment.endpoints.deleteBlog, { id });
    this.isLoading.set(true);

    // 后端返回 { message: string }
    return this.http.delete<{ message: string }>(url).pipe(
      map(() => undefined),
      tap(() => this.isLoading.set(false)),
      catchError(error => {
        this.isLoading.set(false);
        return this.handleError(error);
      })
    );
  }

  /**
   * 获取分类列表
   */
  getCategories(): Observable<Category[]> {
    if (this.useMock) {
      return this.mockDataService.getCategories();
    }

    const url = this.buildUrl(environment.endpoints.categories);

    // 后端直接返回 Category[] 数组
    return this.http.get<Category[]>(url).pipe(
      retry(environment.retryAttempts),
      tap(categories => this.categories.set(categories)),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * 增加浏览量（后端自动处理）
   */
  incrementViewCount(id: string): Observable<void> {
    // 后端在 getBlogById 时自动增加浏览量，前端无需单独调用
    return of(undefined);
  }

  /**
   * 点赞
   */
  likeBlog(id: string): Observable<void> {
    if (this.useMock) {
      return this.mockDataService.likeBlog(id);
    }

    const url = `${this.apiUrl}/blogs/${id}/like`;

    // 后端返回更新后的 Blog 对象
    return this.http.post<Blog>(url, {}).pipe(
      map(() => undefined),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * 搜索博客
   */
  searchBlogs(query: string): Observable<Blog[]> {
    if (this.useMock) {
      return this.mockDataService.searchBlogs(query);
    }

    const url = `${this.apiUrl}/blogs/search`;
    const params = this.buildParams({ q: query });

    // 后端直接返回 Blog[] 数组
    return this.http.get<Blog[]>(url, { params }).pipe(
      retry(environment.retryAttempts),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * 获取热门博客
   */
  getPopularBlogs(limit: number = 5): Observable<Blog[]> {
    if (this.useMock) {
      return this.mockDataService.getPopularBlogs(limit);
    }

    const url = `${this.apiUrl}/blogs/popular`;
    const params = this.buildParams({ limit });

    // 后端直接返回 Blog[] 数组
    return this.http.get<Blog[]>(url, { params }).pipe(
      retry(environment.retryAttempts),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * 获取最新博客
   */
  getRecentBlogs(limit: number = 5): Observable<Blog[]> {
    if (this.useMock) {
      return this.mockDataService.getRecentBlogs(limit);
    }

    const url = `${this.apiUrl}/blogs/recent`;
    const params = this.buildParams({ limit });

    // 后端直接返回 Blog[] 数组
    return this.http.get<Blog[]>(url, { params }).pipe(
      retry(environment.retryAttempts),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * 清除错误状态
   */
  clearError(): void {
    this.error.set(null);
  }
}
