import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Blog, Category, Comment, BlogSEO } from '../models/blog/blog-module';

/**
 * Mock数据服务 - 用于开发和测试
 */
@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  private mockBlogs: Blog[] = [];
  private mockCategories: Category[] = [];
  private mockComments: Comment[] = [];
  
  constructor() {
    this.initializeMockData();
  }
  
  /**
   * 初始化Mock数据
   */
  private initializeMockData(): void {
    // 生成分类
    this.mockCategories = this.generateCategories();
    
    // 生成博客
    this.mockBlogs = this.generateBlogs(50);
    
    // 生成评论
    this.mockComments = this.generateComments(100);
  }
  
  /**
   * 生成分类数据
   */
  private generateCategories(): Category[] {
    return [
      {
        id: '1',
        name: 'Angular',
        slug: 'angular',
        description: 'Angular框架相关技术文章',
        blogCount: 15
      },
      {
        id: '2',
        name: 'TypeScript',
        slug: 'typescript',
        description: 'TypeScript编程语言',
        blogCount: 12
      },
      {
        id: '3',
        name: 'Web开发',
        slug: 'web-development',
        description: '前端Web开发技术',
        blogCount: 20
      },
      {
        id: '4',
        name: 'Node.js',
        slug: 'nodejs',
        description: 'Node.js后端开发',
        blogCount: 8
      },
      {
        id: '5',
        name: '数据库',
        slug: 'database',
        description: '数据库设计与优化',
        blogCount: 6
      },
      {
        id: '6',
        name: 'DevOps',
        slug: 'devops',
        description: '运维与自动化部署',
        blogCount: 5
      },
      {
        id: '7',
        name: '算法',
        slug: 'algorithm',
        description: '算法与数据结构',
        blogCount: 10
      },
      {
        id: '8',
        name: '架构设计',
        slug: 'architecture',
        description: '软件架构与设计模式',
        blogCount: 7
      }
    ];
  }
  
  /**
   * 生成博客数据
   */
  private generateBlogs(count: number): Blog[] {
    const blogs: Blog[] = [];
    const titles = [
      'Angular 20 新特性详解：Signals深度解析',
      'TypeScript 5.0 高级类型系统实战',
      '深入理解Vue3响应式原理',
      'React Hooks最佳实践指南',
      'Node.js性能优化：从理论到实战',
      'MongoDB索引优化完全指南',
      'Docker容器化部署实战教程',
      'Kubernetes集群管理进阶',
      '前端性能优化：首屏加载速度提升50%',
      'Webpack 5配置优化技巧',
      'CSS Grid布局完全指南',
      'JavaScript异步编程：Promise到Async/Await',
      'RESTful API设计最佳实践',
      'GraphQL入门到精通',
      '微前端架构设计与实现',
      '单元测试：Jest与Testing Library',
      'Git工作流：从入门到团队协作',
      'CI/CD自动化部署流程搭建',
      '前端安全：XSS与CSRF防御',
      'Web性能监控与分析',
      'PWA开发实战：打造原生应用体验',
      'WebAssembly：前端性能的未来',
      'Serverless架构实践',
      '设计模式在前端中的应用',
      '函数式编程思想与实践',
      'RxJS响应式编程入门',
      'Electron桌面应用开发',
      'React Native跨平台开发',
      'Flutter移动应用开发指南',
      'Nginx反向代理与负载均衡',
      'Redis缓存策略与实战',
      'PostgreSQL高级查询技巧',
      'MySQL数据库优化指南',
      'ES6+新特性完全解析',
      'Babel与TypeScript编译原理',
      'Vite构建工具深度解析',
      'Tailwind CSS实用技巧',
      'CSS-in-JS方案对比',
      'Web Components组件化开发',
      'Monorepo项目管理实践',
      '前端工程化：从零搭建脚手架',
      '微服务架构设计与实现',
      'OAuth2.0认证授权详解',
      'JWT Token认证机制',
      'WebSocket实时通信',
      '前端数据可视化：ECharts实战',
      'Three.js 3D图形编程',
      'Canvas动画开发技巧',
      'SVG矢量图形应用',
      '响应式设计：移动优先策略'
    ];
    
    const tags = [
      'Angular', 'TypeScript', 'JavaScript', 'React', 'Vue',
      'Node.js', 'Express', 'NestJS', 'MongoDB', 'PostgreSQL',
      'Docker', 'Kubernetes', 'DevOps', 'CI/CD', 'Git',
      'Webpack', 'Vite', 'CSS', 'HTML', 'Web性能',
      '前端工程化', '架构设计', '算法', '数据结构', '设计模式',
      '微服务', 'GraphQL', 'RESTful', '安全', '测试',
      'PWA', 'WebAssembly', 'Serverless', '响应式', '移动开发'
    ];
    
    const authors = ['张三', '李四', '王五', '赵六', '陈七'];
    
    // 使用更可靠的图片源，并添加更多选项
    const coverImages = [
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=400&fit=crop', // 编程
      'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=400&fit=crop', // 代码
      'https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=800&h=400&fit=crop', // 笔记本
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=400&fit=crop', // 办公桌
      'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&h=400&fit=crop', // 技术
      'https://images.unsplash.com/photo-1550439062-609e1531270e?w=800&h=400&fit=crop', // 开发
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=400&fit=crop', // 团队
      'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&h=400&fit=crop', // 工作
      'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=400&fit=crop', // UI/UX
      'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&h=400&fit=crop', // 技术背景
      'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=800&h=400&fit=crop', // 咖啡编程
      'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&h=400&fit=crop'  // 代码屏幕
    ];
    
    for (let i = 0; i < count; i++) {
      const category = this.mockCategories[i % this.mockCategories.length];
      const publishedAt = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000);
      const updatedAt = new Date(publishedAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000);
      
      const blog: Blog = {
        id: `blog-${i + 1}`,
        title: titles[i % titles.length],
        content: this.generateMarkdownContent(),
        excerpt: this.generateExcerpt(),
        // 所有博客都有封面图片，使用不同的图片
        coverImage: coverImages[i % coverImages.length],
        author: authors[i % authors.length],
        authorAvatar: `https://i.pravatar.cc/150?img=${(i % 70) + 1}`,
        categoryId: category.id,
        category: category,
        tags: this.getRandomTags(tags, 3, 5),
        viewCount: Math.floor(Math.random() * 10000),
        likeCount: Math.floor(Math.random() * 1000),
        commentCount: Math.floor(Math.random() * 50),
        isPublished: i % 10 !== 0, // 90%已发布
        publishedAt: publishedAt,
        createdAt: new Date(publishedAt.getTime() - 24 * 60 * 60 * 1000),
        updatedAt: updatedAt,
        seo: this.generateSEO(titles[i % titles.length])
      };
      
      blogs.push(blog);
    }
    
    return blogs;
  }
  
  /**
   * 生成Markdown内容
   */
  private generateMarkdownContent(): string {
    return `# 文章标题

## 简介

这是一篇关于前端开发技术的文章。在本文中，我们将深入探讨现代Web开发的最佳实践和核心概念。

## 背景知识

在开始之前，让我们先了解一些必要的背景知识：

- **前端框架**：React、Vue、Angular等
- **构建工具**：Webpack、Vite等
- **包管理器**：npm、yarn、pnpm等

\`\`\`typescript
// 示例代码
interface User {
  id: string;
  name: string;
  email: string;
}

function greetUser(user: User): string {
  return \`Hello, \${user.name}!\`;
}

const user: User = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com'
};

console.log(greetUser(user));
\`\`\`

## 核心概念

### 1. 组件化开发

组件化是现代前端开发的核心思想。通过将UI拆分为独立、可复用的组件，我们可以：

- 提高代码复用性
- 降低维护成本
- 提升开发效率

### 2. 状态管理

状态管理是大型应用的关键。常见的状态管理方案包括：

1. **Redux** - 可预测的状态容器
2. **MobX** - 简单可扩展的状态管理
3. **Zustand** - 轻量级状态管理库

> **提示**：选择合适的状态管理方案取决于项目的规模和复杂度。

### 3. 性能优化

性能优化是前端开发的永恒话题：

| 优化方向 | 技术手段 | 效果 |
|---------|---------|------|
| 代码分割 | Dynamic Import | 减少首屏加载 |
| 懒加载 | Intersection Observer | 按需加载资源 |
| 缓存策略 | Service Worker | 提升二次加载速度 |

## 实战案例

让我们通过一个实际案例来理解这些概念：

\`\`\`javascript
// 使用React Hooks实现计数器
import { useState, useEffect } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    document.title = \`Count: \${count}\`;
  }, [count]);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
\`\`\`

## 最佳实践

在实际开发中，我们应该遵循以下最佳实践：

1. **保持组件简单** - 单一职责原则
2. **使用TypeScript** - 类型安全
3. **编写测试** - 保证代码质量
4. **代码审查** - 团队协作
5. **持续集成** - 自动化部署

![架构图](https://picsum.photos/600/300)

## 常见问题

### Q: 如何选择前端框架？

A: 选择框架时需要考虑：
- 项目规模和复杂度
- 团队技术栈
- 生态系统成熟度
- 学习曲线

### Q: 性能优化的关键是什么？

A: 关键在于：
- 减少不必要的渲染
- 优化资源加载
- 合理使用缓存
- 监控性能指标

## 工具推荐

以下是一些实用的开发工具：

- **VS Code** - 代码编辑器
- **Chrome DevTools** - 调试工具
- **Postman** - API测试
- **Figma** - UI设计

## 总结

本文介绍了现代前端开发的核心概念和最佳实践。通过学习这些内容，你可以：

✅ 掌握组件化开发思想
✅ 理解状态管理原理
✅ 学会性能优化技巧
✅ 遵循最佳实践规范

## 参考资料

1. [MDN Web Docs](https://developer.mozilla.org)
2. [React官方文档](https://react.dev)
3. [TypeScript Handbook](https://www.typescriptlang.org/docs)
4. [Web.dev](https://web.dev)

---

**标签**：#前端开发 #Web技术 #最佳实践

**发布时间**：2024年1月15日

**作者**：技术博主

如果你觉得这篇文章有帮助，欢迎点赞和分享！`;
  }
  
  /**
   * 生成摘要
   */
  private generateExcerpt(): string {
    const excerpts = [
      '深入探讨现代Web开发框架的核心特性，包括组件化、状态管理、性能优化等关键概念。通过实际案例和代码示例，帮助开发者掌握最佳实践。',
      '本文详细介绍了TypeScript的高级类型系统，包括泛型、条件类型、映射类型等。通过丰富的示例代码，让你快速掌握TypeScript的强大功能。',
      '性能优化是前端开发的重要课题。本文从代码分割、懒加载、缓存策略等多个维度，系统讲解如何提升Web应用的性能表现。',
      '组件化开发是现代前端架构的基石。本文通过实战案例，展示如何设计可复用、可维护的组件，并分享组件开发的最佳实践。',
      '状态管理方案的选择直接影响应用的可维护性。本文对比分析主流状态管理库的特点，帮助你为项目选择最合适的方案。',
      '从零开始搭建前端工程化体系，包括代码规范、自动化测试、CI/CD流程等。让你的团队开发更加高效规范。',
      'Docker容器化技术已成为现代应用部署的标准。本文详细介绍Docker的核心概念和实战应用，帮助你快速上手容器化部署。',
      'RESTful API设计是后端开发的基础。本文总结了API设计的最佳实践，包括资源命名、HTTP方法选择、错误处理等关键要点。',
      '前端安全不容忽视。本文深入分析XSS、CSRF等常见安全问题，并提供实用的防御策略和代码示例。',
      '响应式设计让网站在各种设备上都能提供优质体验。本文介绍移动优先的设计理念和CSS技巧，助你打造完美的响应式网站。'
    ];
    
    return excerpts[Math.floor(Math.random() * excerpts.length)];
  }
  
  /**
   * 生成SEO数据
   */
  private generateSEO(title: string): BlogSEO {
    return {
      metaTitle: title,
      metaDescription: this.generateExcerpt(),
      metaKeywords: this.getRandomTags(
        ['Angular', 'TypeScript', 'JavaScript', 'Web开发', '前端', '后端', 'DevOps'],
        3,
        5
      ),
      ogImage: `https://picsum.photos/1200/630?random=${Math.random()}`,
      canonicalUrl: ''
    };
  }
  
  /**
   * 获取随机标签
   */
  private getRandomTags(tags: string[], min: number, max: number): string[] {
    const count = Math.floor(Math.random() * (max - min + 1)) + min;
    const shuffled = [...tags].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }
  
  /**
   * 生成评论数据
   */
  private generateComments(count: number): Comment[] {
    const comments: Comment[] = [];
    const authors = ['小明', '小红', '小刚', '小丽', '小华', '小张', '小李', '小王'];
    const contents = [
      '写得非常好，学到了很多！',
      '感谢分享，正好需要这方面的知识。',
      '讲解得很清楚，代码示例也很实用。',
      '这篇文章解决了我的问题，太感谢了！',
      '内容很详细，期待更多这样的文章。',
      '干货满满，收藏了！',
      '作者水平很高，讲解深入浅出。',
      '实战案例很有帮助，已经应用到项目中了。',
      '有几个地方还不太理解，能详细说明一下吗？',
      '文章质量很高，推荐给团队同事了。'
    ];
    
    for (let i = 0; i < count; i++) {
      const blogId = `blog-${Math.floor(Math.random() * 50) + 1}`;
      const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
      
      const comment: Comment = {
        id: `comment-${i + 1}`,
        blogId: blogId,
        author: authors[Math.floor(Math.random() * authors.length)],
        email: `user${i}@example.com`,
        content: contents[Math.floor(Math.random() * contents.length)],
        createdAt: createdAt
      };
      
      // 20%的评论有回复
      if (Math.random() < 0.2) {
        comment.replies = [{
          id: `reply-${i + 1}`,
          blogId: blogId,
          author: '博主',
          email: 'admin@example.com',
          content: '感谢支持！如有问题欢迎随时交流。',
          createdAt: new Date(createdAt.getTime() + Math.random() * 24 * 60 * 60 * 1000),
          parentId: comment.id
        }];
      }
      
      comments.push(comment);
    }
    
    return comments;
  }
  
  /**
   * 获取所有博客（分页）
   */
  getBlogs(params?: {
    page?: number;
    limit?: number;
    categoryId?: string;
    tag?: string;
    search?: string;
  }): Observable<{ blogs: Blog[]; total: number }> {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    
    let filtered = [...this.mockBlogs];
    
    // 按分类过滤
    if (params?.categoryId) {
      filtered = filtered.filter(blog => blog.categoryId === params.categoryId);
    }
    
    // 按标签过滤
    if (params?.tag) {
      filtered = filtered.filter(blog => blog.tags.includes(params.tag!));
    }
    
    // 搜索过滤
    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      filtered = filtered.filter(blog => 
        blog.title.toLowerCase().includes(searchLower) ||
        blog.content.toLowerCase().includes(searchLower) ||
        blog.excerpt.toLowerCase().includes(searchLower)
      );
    }
    
    // 只返回已发布的
    filtered = filtered.filter(blog => blog.isPublished);
    
    // 按发布时间倒序排序
    filtered.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
    
    // 分页
    const start = (page - 1) * limit;
    const end = start + limit;
    const blogs = filtered.slice(start, end);
    
    return of({ blogs, total: filtered.length }).pipe(delay(500));
  }
  
  /**
   * 获取博客详情
   */
  getBlogById(id: string): Observable<Blog> {
    const blog = this.mockBlogs.find(b => b.id === id);
    
    if (!blog) {
      throw new Error('博客不存在');
    }
    
    return of(blog).pipe(delay(300));
  }
  
  /**
   * 获取分类列表
   */
  getCategories(): Observable<Category[]> {
    return of(this.mockCategories).pipe(delay(200));
  }
  
  /**
   * 获取热门博客
   */
  getPopularBlogs(limit: number = 5): Observable<Blog[]> {
    const popular = [...this.mockBlogs]
      .filter(blog => blog.isPublished)
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, limit);
    
    return of(popular).pipe(delay(300));
  }
  
  /**
   * 获取最新博客
   */
  getRecentBlogs(limit: number = 5): Observable<Blog[]> {
    const recent = [...this.mockBlogs]
      .filter(blog => blog.isPublished)
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
      .slice(0, limit);
    
    return of(recent).pipe(delay(300));
  }
  
  /**
   * 搜索博客
   */
  searchBlogs(query: string): Observable<Blog[]> {
    const searchLower = query.toLowerCase();
    const results = this.mockBlogs.filter(blog =>
      blog.isPublished && (
        blog.title.toLowerCase().includes(searchLower) ||
        blog.content.toLowerCase().includes(searchLower) ||
        blog.tags.some(tag => tag.toLowerCase().includes(searchLower))
      )
    );
    
    return of(results).pipe(delay(400));
  }
  
  /**
   * 创建博客
   */
  createBlog(blog: Partial<Blog>): Observable<Blog> {
    const newBlog: Blog = {
      id: `blog-${this.mockBlogs.length + 1}`,
      title: blog.title || '',
      content: blog.content || '',
      excerpt: blog.excerpt || '',
      coverImage: blog.coverImage,
      author: blog.author || '管理员',
      authorAvatar: 'https://i.pravatar.cc/150?img=1',
      categoryId: blog.categoryId || '1',
      category: this.mockCategories.find(c => c.id === blog.categoryId) || this.mockCategories[0],
      tags: blog.tags || [],
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      isPublished: blog.isPublished || false,
      publishedAt: blog.isPublished ? new Date() : new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      seo: blog.seo || this.generateSEO(blog.title || '')
    };
    
    this.mockBlogs.unshift(newBlog);
    
    return of(newBlog).pipe(delay(500));
  }
  
  /**
   * 更新博客
   */
  updateBlog(id: string, blog: Partial<Blog>): Observable<Blog> {
    const index = this.mockBlogs.findIndex(b => b.id === id);
    
    if (index === -1) {
      throw new Error('博客不存在');
    }
    
    const updatedBlog = {
      ...this.mockBlogs[index],
      ...blog,
      updatedAt: new Date()
    };
    
    this.mockBlogs[index] = updatedBlog;
    
    return of(updatedBlog).pipe(delay(500));
  }
  
  /**
   * 删除博客
   */
  deleteBlog(id: string): Observable<void> {
    const index = this.mockBlogs.findIndex(b => b.id === id);
    
    if (index !== -1) {
      this.mockBlogs.splice(index, 1);
    }
    
    return of(void 0).pipe(delay(300));
  }
  
  /**
   * 增加浏览量
   */
  incrementViewCount(id: string): Observable<void> {
    const blog = this.mockBlogs.find(b => b.id === id);
    
    if (blog) {
      blog.viewCount++;
    }
    
    return of(void 0).pipe(delay(100));
  }
  
  /**
   * 点赞
   */
  likeBlog(id: string): Observable<void> {
    const blog = this.mockBlogs.find(b => b.id === id);
    
    if (blog) {
      blog.likeCount++;
    }
    
    return of(void 0).pipe(delay(200));
  }
  
  /**
   * 获取评论
   */
  getComments(blogId: string): Observable<Comment[]> {
    const comments = this.mockComments.filter(c => c.blogId === blogId);
    return of(comments).pipe(delay(300));
  }
  
  /**
   * 创建评论
   */
  createComment(comment: Omit<Comment, 'id' | 'createdAt'>): Observable<Comment> {
    const newComment: Comment = {
      ...comment,
      id: `comment-${this.mockComments.length + 1}`,
      createdAt: new Date()
    };
    
    this.mockComments.push(newComment);
    
    // 更新博客评论数
    const blog = this.mockBlogs.find(b => b.id === comment.blogId);
    if (blog) {
      blog.commentCount++;
    }
    
    return of(newComment).pipe(delay(400));
  }
}