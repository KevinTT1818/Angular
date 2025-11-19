import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Blog } from '../models/blog/blog-module';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private meta = inject(Meta);
  private title = inject(Title);
  private router = inject(Router);
  
  constructor() {
    // 监听路由变化，更新SEO
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateCanonicalUrl();
      });
  }
  
  /**
   * 设置页面标题
   */
  setTitle(title: string, appendSiteName: boolean = true): void {
    const fullTitle = appendSiteName ? `${title} | 我的博客` : title;
    this.title.setTitle(fullTitle);
  }
  
  /**
   * 更新Meta标签
   */
  updateMetaTags(config: {
    title?: string;
    description?: string;
    keywords?: string[];
    image?: string;
    type?: string;
    url?: string;
  }): void {
    if (config.title) {
      this.setTitle(config.title);
      this.meta.updateTag({ property: 'og:title', content: config.title });
      this.meta.updateTag({ name: 'twitter:title', content: config.title });
    }
    
    if (config.description) {
      this.meta.updateTag({ name: 'description', content: config.description });
      this.meta.updateTag({ property: 'og:description', content: config.description });
      this.meta.updateTag({ name: 'twitter:description', content: config.description });
    }
    
    if (config.keywords) {
      this.meta.updateTag({ name: 'keywords', content: config.keywords.join(', ') });
    }
    
    if (config.image) {
      this.meta.updateTag({ property: 'og:image', content: config.image });
      this.meta.updateTag({ name: 'twitter:image', content: config.image });
      this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    }
    
    if (config.type) {
      this.meta.updateTag({ property: 'og:type', content: config.type });
    }
    
    if (config.url) {
      this.meta.updateTag({ property: 'og:url', content: config.url });
      this.meta.updateTag({ name: 'twitter:url', content: config.url });
    }
  }
  
  /**
   * 为博客文章设置SEO
   */
  setBlogSEO(blog: Blog): void {
    const url = `${window.location.origin}/blog/${blog.id}`;
    
    this.updateMetaTags({
      title: blog.seo.metaTitle || blog.title,
      description: blog.seo.metaDescription || blog.excerpt,
      keywords: blog.seo.metaKeywords || blog.tags,
      image: blog.seo.ogImage || blog.coverImage,
      type: 'article',
      url: url
    });
    
    // 设置文章特定的Meta标签
    this.meta.updateTag({ property: 'article:published_time', content: blog.publishedAt.toISOString() });
    this.meta.updateTag({ property: 'article:modified_time', content: blog.updatedAt.toISOString() });
    this.meta.updateTag({ property: 'article:author', content: blog.author });
    
    blog.tags.forEach(tag => {
      this.meta.addTag({ property: 'article:tag', content: tag });
    });
    
    // 更新canonical URL
    this.updateCanonicalUrl(blog.seo.canonicalUrl || url);
  }
  
  /**
   * 更新Canonical URL
   */
  updateCanonicalUrl(url?: string): void {
    const canonicalUrl = url || window.location.href;
    
    // 移除旧的canonical标签
    const existingLink = document.querySelector('link[rel="canonical"]');
    if (existingLink) {
      existingLink.remove();
    }
    
    // 添加新的canonical标签
    const link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', canonicalUrl);
    document.head.appendChild(link);
  }
  
  /**
   * 添加结构化数据 (JSON-LD)
   */
  addStructuredData(data: any): void {
    // 移除旧的结构化数据
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }
    
    // 添加新的结构化数据
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(data);
    document.head.appendChild(script);
  }
  
  /**
   * 为博客文章添加结构化数据
   */
  addBlogStructuredData(blog: Blog): void {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      'headline': blog.title,
      'description': blog.excerpt,
      'image': blog.coverImage,
      'author': {
        '@type': 'Person',
        'name': blog.author
      },
      'datePublished': blog.publishedAt.toISOString(),
      'dateModified': blog.updatedAt.toISOString(),
      'publisher': {
        '@type': 'Organization',
        'name': '我的博客',
        'logo': {
          '@type': 'ImageObject',
          'url': `${window.location.origin}/assets/logo.png`
        }
      },
      'keywords': blog.tags.join(', ')
    };
    
    this.addStructuredData(structuredData);
  }
  
  /**
   * 重置SEO为默认值
   */
  resetSEO(): void {
    this.updateMetaTags({
      title: '我的博客',
      description: '欢迎来到我的个人博客，分享技术文章和生活感悟',
      keywords: ['博客', '技术', 'Angular', 'Web开发'],
      type: 'website'
    });
  }
}