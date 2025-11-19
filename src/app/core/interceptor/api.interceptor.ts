import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * API拦截器 - 添加认证token和API前缀
 */
export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  // 克隆请求并添加配置
  let modifiedReq = req.clone({
    setHeaders: {
      'Content-Type': 'application/json'
    }
  });
  
  // 如果有token，添加到请求头
  const token = authService.getToken();
  if (token) {
    modifiedReq = modifiedReq.clone({
      setHeaders: {
        'Authorization': `Bearer ${token}`
      }
    });
  }
  
  // 如果是相对路径，添加API前缀
  if (!req.url.startsWith('http')) {
    const apiUrl = '/api' + (req.url.startsWith('/') ? req.url : `/${req.url}`);
    modifiedReq = modifiedReq.clone({
      url: apiUrl
    });
  }
  
  return next(modifiedReq);
};