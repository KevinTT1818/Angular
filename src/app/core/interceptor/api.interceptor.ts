import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * API拦截器 - 添加API前缀和基础配置
 * Note: Authorization 头由 authInterceptor 处理
 */
export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  // 克隆请求并添加配置
  let modifiedReq = req.clone({
    setHeaders: {
      'Content-Type': 'application/json'
    }
  });

  // 如果是相对路径，添加API前缀
  if (!req.url.startsWith('http')) {
    const apiUrl = '/api' + (req.url.startsWith('/') ? req.url : `/${req.url}`);
    modifiedReq = modifiedReq.clone({
      url: apiUrl
    });
  }

  return next(modifiedReq);
};