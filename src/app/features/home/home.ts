import { Component, signal, computed, inject, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { register } from 'swiper/element/bundle';
import { BlogService } from '../../core/services/blog.service';
import { SeoService } from '../../core/services/seo.service';
import { Blog } from '../../core/models/blog/blog-module';

// 注册 Swiper 自定义元素
register();

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HomeComponent implements OnInit {
  private blogService = inject(BlogService);
  private seoService = inject(SeoService);

  latestBlogs = signal<Blog[]>([]);
  featuredBlog = signal<Blog | null>(null);
  isLoading = signal(false);

  // Swiper 配置
  // 使用 rewind 模式替代 loop，避免分页器点击卡住问题
  swiperConfig = {
    loop: false,  // 禁用 loop，避免与分页器冲突
    rewind: true, // 启用 rewind，到最后一张后自动回到第一张
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
      pauseOnMouseEnter: true
    },
    pagination: {
      clickable: true,
      dynamicBullets: false,
      renderBullet: (index: number, className: string) => {
        return `<span class="${className}"></span>`;
      }
    },
    navigation: true,
    breakpoints: {
      320: {
        slidesPerView: 1,
        spaceBetween: 20
      },
      768: {
        slidesPerView: 2,
        spaceBetween: 25
      },
      1024: {
        slidesPerView: 3,
        spaceBetween: 30
      }
    }
  };

  ngOnInit(): void {
    // 设置 SEO
    this.seoService.updateMetaTags({
      title: '首页',
      description: '欢迎来到我的个人博客，分享技术文章和生活感悟',
      keywords: ['博客', '技术', 'Angular', 'Web开发']
    });

    // 加载最新文章
    this.loadLatestBlogs();
  }

  loadLatestBlogs(): void {
    this.isLoading.set(true);

    // 加载 12 篇最新文章
    this.blogService.getRecentBlogs(12).subscribe({
      next: (blogs) => {
        this.latestBlogs.set(blogs);
        // 第一篇作为特色文章
        if (blogs.length > 0) {
          this.featuredBlog.set(blogs[0]);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('加载最新文章失败:', error);
        this.isLoading.set(false);
      }
    });
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
