import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // 获取 access token
  const token = authService.getAccessToken();

  // 如果有 token，添加到请求头
  if (token && !authService.isTokenExpired(token)) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // 如果是 401 错误，尝试刷新 token
      if (error.status === 401 && token) {
        return authService.refreshToken().pipe(
          switchMap((response) => {
            // 使用新的 token 重试请求
            const newReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${response.accessToken}`,
              },
            });
            return next(newReq);
          }),
          catchError((refreshError) => {
            // 刷新失败，退出登录
            authService.logout();
            return throwError(() => refreshError);
          })
        );
      }

      return throwError(() => error);
    })
  );
};
