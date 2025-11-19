import { Component, signal, effect, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MarkdownModule } from 'ngx-markdown';
import { BlogService } from '../../core/services/blog.service';
import { Blog, Category } from '../../core/models/blog/blog-module';
import { ImageUploadService } from '../../core/services/image-upload.service';

@Component({
  selector: 'app-blog-editor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MarkdownModule],
  templateUrl: './blog-editor.html',
  styleUrls: ['./blog-editor.scss']
})
export class BlogEditorComponent implements OnInit {
  private fb = inject(FormBuilder);
  private blogService = inject(BlogService);
  private imageUploadService = inject(ImageUploadService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Signals
  markdownContent = signal('');
  previewMode = signal(false);
  categories = signal<Category[]>([]);
  isEditMode = signal(false);
  blogId = signal<string | null>(null);
  isSaving = signal(false);
  isUploadingImage = signal(false);
  uploadProgress = signal(0);
  
  // 表单
  blogForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    content: ['', Validators.required],
    excerpt: ['', [Validators.required, Validators.maxLength(200)]],
    coverImage: [''],
    categoryId: ['', Validators.required],
    tags: [''],
    isPublished: [false],
    // SEO字段
    metaTitle: [''],
    metaDescription: [''],
    metaKeywords: ['']
  });
  
  ngOnInit(): void {
    // 加载分类
    this.blogService.getCategories().subscribe(
      categories => this.categories.set(categories)
    );
    
    // 检查是否编辑模式
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.blogId.set(id);
      this.loadBlog(id);
    }
    
    // 监听内容变化更新预览
    this.blogForm.get('content')?.valueChanges.subscribe(
      content => this.markdownContent.set(content)
    );
  }
  
  /**
   * 加载博客数据
   */
  loadBlog(id: string): void {
    this.blogService.getBlogById(id).subscribe({
      next: (blog) => {
        this.blogForm.patchValue({
          title: blog.title,
          content: blog.content,
          excerpt: blog.excerpt,
          coverImage: blog.coverImage,
          categoryId: blog.categoryId,
          tags: blog.tags.join(', '),
          isPublished: blog.isPublished,
          metaTitle: blog.seo.metaTitle,
          metaDescription: blog.seo.metaDescription,
          metaKeywords: blog.seo.metaKeywords.join(', ')
        });
        this.markdownContent.set(blog.content);
      },
      error: (error) => {
        console.error('加载博客失败:', error);
        alert('加载博客失败');
      }
    });
  }
  
  /**
   * 切换预览模式
   */
  togglePreview(): void {
    this.previewMode.update(mode => !mode);
  }
  
  /**
   * 插入Markdown语法
   */
  insertMarkdown(syntax: string): void {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const content = this.blogForm.get('content')?.value || '';
    const selectedText = content.substring(start, end);
    
    let newText = '';
    let cursorOffset = 0;
    
    switch (syntax) {
      case 'bold':
        newText = `**${selectedText || '粗体文字'}**`;
        cursorOffset = selectedText ? 2 : 6;
        break;
      case 'italic':
        newText = `*${selectedText || '斜体文字'}*`;
        cursorOffset = selectedText ? 1 : 5;
        break;
      case 'heading':
        newText = `\n## ${selectedText || '标题'}\n`;
        cursorOffset = selectedText ? 3 : 5;
        break;
      case 'link':
        newText = `[${selectedText || '链接文字'}](url)`;
        cursorOffset = selectedText ? 2 : 6;
        break;
      case 'image':
        newText = `![${selectedText || '图片描述'}](image-url)`;
        cursorOffset = selectedText ? 2 : 6;
        break;
      case 'code':
        newText = `\`${selectedText || '代码'}\``;
        cursorOffset = selectedText ? 1 : 3;
        break;
      case 'code-block':
        newText = `\n\`\`\`javascript\n${selectedText || '代码块'}\n\`\`\`\n`;
        cursorOffset = selectedText ? 16 : 19;
        break;
      case 'quote':
        newText = `\n> ${selectedText || '引用文字'}\n`;
        cursorOffset = selectedText ? 3 : 8;
        break;
      case 'list':
        newText = `\n- ${selectedText || '列表项'}\n`;
        cursorOffset = selectedText ? 3 : 7;
        break;
    }
    
    const newContent = content.substring(0, start) + newText + content.substring(end);
    this.blogForm.patchValue({ content: newContent });
    
    // 恢复焦点和光标位置
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + cursorOffset,
        start + cursorOffset
      );
    }, 0);
  }
  
  /**
   * 上传图片
   */
  async uploadImage(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    // 验证图片
    const validation = this.imageUploadService.validateImage(file);
    if (!validation.valid) {
      alert(validation.error);
      // 清空input
      input.value = '';
      return;
    }

    this.isUploadingImage.set(true);
    this.uploadProgress.set(0);

    try {
      // 创建预览
      const previewUrl = await this.imageUploadService.createPreviewUrl(file);

      // 暂时显示预览
      const currentContent = this.blogForm.get('content')?.value || '';
      const tempContent = `${currentContent}\n![上传中...](${previewUrl})\n`;
      this.blogForm.patchValue({ content: tempContent });

      // 模拟上传进度
      const progressInterval = setInterval(() => {
        const current = this.uploadProgress();
        if (current < 90) {
          this.uploadProgress.set(current + 10);
        }
      }, 100);

      // 上传图片
      this.imageUploadService.uploadImage(file).subscribe({
        next: (result) => {
          clearInterval(progressInterval);
          this.uploadProgress.set(100);

          // 替换临时内容为真实URL
          const content = this.blogForm.get('content')?.value || '';
          const finalContent = content.replace(
            `![上传中...](${previewUrl})`,
            `![${file.name}](${result.url})`
          );
          this.blogForm.patchValue({ content: finalContent });

          // 显示成功消息
          console.log('图片上传成功:', result);

          // 重置状态
          setTimeout(() => {
            this.isUploadingImage.set(false);
            this.uploadProgress.set(0);
          }, 500);

          // 清空input以允许重新选择同一文件
          input.value = '';
        },
        error: (error) => {
          clearInterval(progressInterval);
          this.isUploadingImage.set(false);
          this.uploadProgress.set(0);

          // 移除临时内容
          const content = this.blogForm.get('content')?.value || '';
          const cleanContent = content.replace(`\n![上传中...](${previewUrl})\n`, '');
          this.blogForm.patchValue({ content: cleanContent });

          console.error('图片上传失败:', error);
          alert(`图片上传失败: ${error.message || '未知错误'}`);

          // 清空input
          input.value = '';
        }
      });
    } catch (error: any) {
      this.isUploadingImage.set(false);
      this.uploadProgress.set(0);
      console.error('图片处理失败:', error);
      alert(`图片处理失败: ${error.message || '未知错误'}`);
      input.value = '';
    }
  }
  
  /**
   * 自动生成摘要
   */
  generateExcerpt(): void {
    const content = this.blogForm.get('content')?.value;
    if (!content) return;
    
    // 移除Markdown语法，提取纯文本
    const plainText = content
      .replace(/[#*`>\-\[\]]/g, '')
      .replace(/!\[.*?\]\(.*?\)/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '')
      .trim();
    
    const excerpt = plainText.substring(0, 200);
    this.blogForm.patchValue({ excerpt });
  }
  
  /**
   * 保存草稿
   */
  saveDraft(): void {
    if (this.blogForm.invalid) {
      alert('请填写必填字段');
      return;
    }
    
    this.isSaving.set(true);
    const formValue = this.blogForm.value;
    
    const blogData: Partial<Blog> = {
      title: formValue.title,
      content: formValue.content,
      excerpt: formValue.excerpt,
      coverImage: formValue.coverImage,
      categoryId: formValue.categoryId,
      tags: formValue.tags.split(',').map((tag: string) => tag.trim()),
      isPublished: false,
      seo: {
        metaTitle: formValue.metaTitle || formValue.title,
        metaDescription: formValue.metaDescription || formValue.excerpt,
        metaKeywords: formValue.metaKeywords.split(',').map((kw: string) => kw.trim())
      }
    };
    
    const request$ = this.isEditMode()
      ? this.blogService.updateBlog(this.blogId()!, blogData)
      : this.blogService.createBlog(blogData);
    
    request$.subscribe({
      next: (blog) => {
        this.isSaving.set(false);
        alert('草稿保存成功');
        if (!this.isEditMode()) {
          this.router.navigate(['/admin/blogs', blog.id, 'edit']);
        }
      },
      error: (error) => {
        this.isSaving.set(false);
        console.error('保存失败:', error);
        alert('保存失败');
      }
    });
  }
  
  /**
   * 发布博客
   */
  publishBlog(): void {
    if (this.blogForm.invalid) {
      alert('请填写所有必填字段');
      this.markFormGroupTouched(this.blogForm);
      return;
    }
    
    this.isSaving.set(true);
    const formValue = this.blogForm.value;
    
    const blogData: Partial<Blog> = {
      title: formValue.title,
      content: formValue.content,
      excerpt: formValue.excerpt,
      coverImage: formValue.coverImage,
      categoryId: formValue.categoryId,
      tags: formValue.tags.split(',').map((tag: string) => tag.trim()),
      isPublished: true,
      publishedAt: new Date(),
      seo: {
        metaTitle: formValue.metaTitle || formValue.title,
        metaDescription: formValue.metaDescription || formValue.excerpt,
        metaKeywords: formValue.metaKeywords.split(',').map((kw: string) => kw.trim())
      }
    };
    
    const request$ = this.isEditMode()
      ? this.blogService.updateBlog(this.blogId()!, blogData)
      : this.blogService.createBlog(blogData);
    
    request$.subscribe({
      next: (blog) => {
        this.isSaving.set(false);
        alert('博客发布成功！');
        this.router.navigate(['/blog', blog.id]);
      },
      error: (error) => {
        this.isSaving.set(false);
        console.error('发布失败:', error);
        alert('发布失败');
      }
    });
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