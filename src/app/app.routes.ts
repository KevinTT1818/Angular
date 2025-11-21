import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  // 首页
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },

  // 登录页面
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login').then(m => m.LoginComponent),
    title: '登录 | 我的博客'
  },

  // 注册页面
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register').then(m => m.RegisterComponent),
    title: '注册 | 我的博客'
  },

  // 首页
  {
    path: 'home',
    loadComponent: () =>
      import('./features/home/home').then(m => m.HomeComponent),
    title: '首页 | 我的博客'
  },

  // 数据统计Dashboard
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard').then(m => m.DashboardComponent),
    title: '数据统计 | 我的博客'
  },

  // 博客列表
  {
    path: 'blogs',
    loadComponent: () =>
      import('./features/blog-list/blog-list').then(m => m.BlogListComponent),
    title: '博客列表 | 我的博客'
  },
  
  // 博客详情
  {
    path: 'blog/:id',
    loadComponent: () =>
      import('./features/blog-detail/blog-detail').then(m => m.BlogDetailComponent)
    // title 会在组件中动态设置
  },
  
  // 博客编辑器（简化的管理功能）
  {
    path: 'admin/blogs/new',
    loadComponent: () =>
      import('./features/blog-editor/blog-editor').then(m => m.BlogEditorComponent),
    title: '新建博客 | 后台管理'
  },
  {
    path: 'admin/blogs/:id/edit',
    loadComponent: () =>
      import('./features/blog-editor/blog-editor').then(m => m.BlogEditorComponent),
    title: '编辑博客 | 后台管理'
  },
  
  // 404页面
  {
    path: '404',
    loadComponent: () =>
      import('./features/not-found/not-found/not-found').then(m => m.NotFoundComponent),
    title: '页面未找到 | 我的博客'
  },
  
  // 通配符路由（必须放在最后）
  {
    path: '**',
    redirectTo: '/404'
  }
];