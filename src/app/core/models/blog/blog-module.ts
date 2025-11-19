import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


export interface Blog {
  id: string;
  title: string;
  content: string;           // Markdown内容
  excerpt: string;           // 摘要
  coverImage?: string;
  author: string;
  authorAvatar?: string;
  categoryId: string;
  category: Category;
  tags: string[];
  viewCount: number;
  likeCount: number;
  commentCount: number;
  isPublished: boolean;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  seo: BlogSEO;
}

export interface BlogSEO {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  ogImage?: string;
  canonicalUrl?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  blogCount: number;
  icon?: string;
  color?: string;
}

export interface Comment {
  id: string;
  blogId: string;
  author: string;
  email: string;
  content: string;
  createdAt: Date;
  parentId?: string;
  replies?: Comment[];
}

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ]
})
export class BlogModule { }
