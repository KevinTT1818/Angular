import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * 错误拦截器 - 统一处理HTTP错误
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = '发生未知错误';
      
      if (error.error instanceof ErrorEvent) {
        // 客户端错误
        errorMessage = `错误: ${error.error.message}`;
      } else {
        // 服务器错误
        switch (error.status) {
          case 400:
            errorMessage = '请求参数错误';
            break;
          case 401:
            errorMessage = '未授权，请重新登录';
            authService.logout();
            router.navigate(['/login']);
            break;
          case 403:
            errorMessage = '没有权限访问';
            break;
          case 404:
            errorMessage = '请求的资源不存在';
            break;
          case 500:
            errorMessage = '服务器内部错误';
            break;
          case 503:
            errorMessage = '服务暂时不可用';
            break;
          default:
            errorMessage = error.error?.message || `错误代码: ${error.status}`;
        }
      }
      
      console.error('HTTP错误:', errorMessage, error);
      
      // 可以在这里添加全局错误提示
      // this.notificationService.error(errorMessage);
      
      return throwError(() => new Error(errorMessage));
    })
  );
};