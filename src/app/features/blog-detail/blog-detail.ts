import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';
import { BlogService } from '../../core/services/blog.service';
import { SeoService } from '../../core/services/seo.service';
import { Blog, Comment } from '../../core/models/blog/blog-module';
import { DateFormatPipe } from '../../shared/pipes/date-format-pipe';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MarkdownModule,
    DateFormatPipe
  ],
  templateUrl: './blog-detail.html',
  styleUrls: ['./blog-detail.scss']
})
export class BlogDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private blogService = inject(BlogService);
  private seoService = inject(SeoService);
  private fb = inject(FormBuilder);
  
  // Signals
  blog = signal<Blog | null>(null);
  relatedBlogs = signal<Blog[]>([]);
  comments = signal<Comment[]>([]);
  isLoading = signal(true);
  isLiked = signal(false);
  showCommentForm = signal(false);
  isSubmittingComment = signal(false);
  
  // 评论表单
  commentForm: FormGroup = this.fb.group({
    author: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    content: ['', [Validators.required, Validators.minLength(5)]]
  });
  
  // 目录导航
  tocItems = signal<{ id: string; text: string; level: number }[]>([]);
  activeSection = signal<string>('');
  
  private intersectionObserver?: IntersectionObserver;
  
  ngOnInit(): void {
    // 获取博客ID
    const blogId = this.route.snapshot.paramMap.get('id');
    
    if (blogId) {
      this.loadBlog(blogId);
    } else {
      this.router.navigate(['/blogs']);
    }
    
    // 检查是否已点赞
    this.checkLikeStatus();
  }
  
  ngOnDestroy(): void {
    // 清理观察器
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
  }
  
  /**
   * 加载博客
   */
  loadBlog(id: string): void {
    this.isLoading.set(true);
    
    this.blogService.getBlogById(id).subscribe({
      next: (blog) => {
        this.blog.set(blog);
        this.isLoading.set(false);
        
        // 设置SEO
        this.seoService.setBlogSEO(blog);
        this.seoService.addBlogStructuredData(blog);
        
        // 生成目录
        setTimeout(() => {
          this.generateTOC();
          this.setupIntersectionObserver();
        }, 100);
        
        // 加载相关博客
        this.loadRelatedBlogs(blog);
        
        // 加载评论
        this.loadComments(id);
      },
      error: (error) => {
        console.error('加载博客失败:', error);
        this.isLoading.set(false);
        this.router.navigate(['/blogs']);
      }
    });
  }
  
  /**
   * 加载相关博客
   */
  loadRelatedBlogs(blog: Blog): void {
    // 根据分类或标签查找相关博客
    this.blogService.getBlogs({
      categoryId: blog.categoryId,
      limit: 5
    }).subscribe({
      next: (response) => {
        // 排除当前博客
        const related = response.blogs.filter(b => b.id !== blog.id);
        this.relatedBlogs.set(related.slice(0, 4));
      }
    });
  }
  
  /**
   * 加载评论
   */
  loadComments(blogId: string): void {
    // 这里应该调用评论API
    // 示例数据
    const mockComments: Comment[] = [
      {
        id: '1',
        blogId: blogId,
        author: '张三',
        email: 'zhangsan@example.com',
        content: '写得非常好，学到了很多！',
        createdAt: new Date('2024-01-15'),
        replies: [
          {
            id: '2',
            blogId: blogId,
            author: '博主',
            email: 'admin@example.com',
            content: '谢谢支持！',
            createdAt: new Date('2024-01-16'),
            parentId: '1'
          }
        ]
      }
    ];
    
    this.comments.set(mockComments);
  }
  
  /**
   * 生成目录
   */
  generateTOC(): void {
    const contentElement = document.querySelector('.markdown-body');
    if (!contentElement) return;
    
    const headings = contentElement.querySelectorAll('h1, h2, h3, h4');
    const toc: { id: string; text: string; level: number }[] = [];
    
    headings.forEach((heading, index) => {
      const id = `heading-${index}`;
      heading.id = id;
      
      const level = parseInt(heading.tagName.substring(1));
      toc.push({
        id,
        text: heading.textContent || '',
        level
      });
    });
    
    this.tocItems.set(toc);
  }
  
  /**
   * 设置交叉观察器（高亮当前章节）
   */
  setupIntersectionObserver(): void {
    const options = {
      rootMargin: '-80px 0px -80% 0px',
      threshold: 0
    };
    
    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.activeSection.set(entry.target.id);
        }
      });
    }, options);
    
    // 观察所有标题
    this.tocItems().forEach(item => {
      const element = document.getElementById(item.id);
      if (element) {
        this.intersectionObserver?.observe(element);
      }
    });
  }
  
  /**
   * 滚动到指定章节
   */
  scrollToSection(id: string): void {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // 头部高度
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }
  
  /**
   * 点赞
   */
  toggleLike(): void {
    const blog = this.blog();
    if (!blog) return;
    
    if (this.isLiked()) {
      // 取消点赞（实际项目中应该调用API）
      blog.likeCount--;
      this.isLiked.set(false);
      localStorage.removeItem(`liked_${blog.id}`);
    } else {
      // 点赞
      this.blogService.likeBlog(blog.id).subscribe({
        next: () => {
          blog.likeCount++;
          this.isLiked.set(true);
          localStorage.setItem(`liked_${blog.id}`, 'true');
        },
        error: (error) => {
          console.error('点赞失败:', error);
        }
      });
    }
    
    this.blog.set({ ...blog });
  }
  
  /**
   * 检查点赞状态
   */
  checkLikeStatus(): void {
    const blog = this.blog();
    if (blog) {
      const liked = localStorage.getItem(`liked_${blog.id}`);
      this.isLiked.set(liked === 'true');
    }
  }
  
  /**
   * 显示评论表单
   */
  toggleCommentForm(): void {
    this.showCommentForm.update(show => !show);
  }
  
  /**
   * 提交评论
   */
  submitComment(): void {
    if (this.commentForm.invalid) {
      this.markFormGroupTouched(this.commentForm);
      return;
    }
    
    const blog = this.blog();
    if (!blog) return;
    
    this.isSubmittingComment.set(true);
    
    const comment: Comment = {
      id: Date.now().toString(),
      blogId: blog.id,
      author: this.commentForm.value.author,
      email: this.commentForm.value.email,
      content: this.commentForm.value.content,
      createdAt: new Date()
    };
    
    // 这里应该调用API提交评论
    setTimeout(() => {
      this.comments.update(comments => [comment, ...comments]);
      blog.commentCount++;
      this.blog.set({ ...blog });
      
      this.commentForm.reset();
      this.showCommentForm.set(false);
      this.isSubmittingComment.set(false);
      
      alert('评论发表成功！');
    }, 1000);
  }
  
  /**
   * 分享功能
   */
  share(platform: string): void {
    const blog = this.blog();
    if (!blog) return;
    
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(blog.title);
    
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${title}&url=${url}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case 'weibo':
        shareUrl = `https://service.weibo.com/share/share.php?title=${title}&url=${url}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  }
  
  /**
   * 复制链接
   */
  copyLink(): void {
    navigator.clipboard.writeText(window.location.href).then(() => {
      alert('链接已复制到剪贴板！');
    });
  }
  
  /**
   * 导航到相关博客
   */
  goToBlog(blogId: string): void {
    this.router.navigate(['/blog', blogId]);
    // 重新加载页面
    window.scrollTo(0, 0);
    this.loadBlog(blogId);
  }
  
  /**
   * 标记表单所有字段为touched
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}