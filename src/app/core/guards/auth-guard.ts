import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * 认证守卫 - 保护需要登录的路由
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.isAuthenticated()) {
    return true;
  }
  
  // 未登录，重定向到登录页面，并保存原始URL
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });
};

/**
 * 角色守卫 - 检查用户角色
 */
export const roleGuard: (allowedRoles: string[]) => CanActivateFn = 
  (allowedRoles: string[]) => (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    
    if (!authService.isAuthenticated()) {
      return router.createUrlTree(['/login']);
    }
    
    const userRole = authService.getUserRole();
    
    if (allowedRoles.includes(userRole)) {
      return true;
    }
    
    // 权限不足，重定向到首页
    return router.createUrlTree(['/']);
  };

/**
 * 未认证守卫 - 已登录用户不能访问（如登录页）
 */
export const unauthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (!authService.isAuthenticated()) {
    return true;
  }
  
  // 已登录，重定向到管理后台
  return router.createUrlTree(['/admin/dashboard']);
};