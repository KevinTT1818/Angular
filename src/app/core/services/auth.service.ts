import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  avatar?: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  // Signals
  currentUser = signal<User | null>(null);
  isLoggedIn = signal(false);
  
  constructor() {
    // 初始化时检查本地存储的token
    this.checkStoredAuth();
  }
  
  /**
   * 检查本地存储的认证信息
   */
  private checkStoredAuth(): void {
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('current_user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUser.set(user);
        this.isLoggedIn.set(true);
      } catch (e) {
        this.clearAuth();
      }
    }
  }
  
  /**
   * 登录（支持email或username）
   */
  login(email: string, password: string): Observable<LoginResponse> {
    // Mock登录 - 仅用于演示
    // 在生产环境中应该调用真实API
    return new Observable(observer => {
      setTimeout(() => {
        // 模拟登录验证
        if (email && password.length >= 6) {
          const mockResponse: LoginResponse = {
            token: 'mock_jwt_token_' + Date.now(),
            user: {
              id: '1',
              username: email.split('@')[0],
              email: email,
              role: 'admin',
              avatar: `https://ui-avatars.com/api/?name=${email.split('@')[0]}&background=667eea&color=fff`
            }
          };

          // 保存token和用户信息
          localStorage.setItem('auth_token', mockResponse.token);
          localStorage.setItem('current_user', JSON.stringify(mockResponse.user));

          this.currentUser.set(mockResponse.user);
          this.isLoggedIn.set(true);

          observer.next(mockResponse);
          observer.complete();
        } else {
          observer.error({ message: '邮箱或密码不正确' });
        }
      }, 1000); // 模拟网络延迟
    });

    /* 真实API调用（取消注释以使用）
    return this.http.post<LoginResponse>('/api/auth/login', { email, password })
      .pipe(
        tap(response => {
          localStorage.setItem('auth_token', response.token);
          localStorage.setItem('current_user', JSON.stringify(response.user));

          this.currentUser.set(response.user);
          this.isLoggedIn.set(true);
        })
      );
    */
  }
  
  /**
   * 登出
   */
  logout(): void {
    this.clearAuth();
    this.router.navigate(['/login']);
  }
  
  /**
   * 清除认证信息
   */
  private clearAuth(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
  }
  
  /**
   * 检查是否已认证
   */
  isAuthenticated(): boolean {
    return this.isLoggedIn();
  }
  
  /**
   * 获取当前用户
   */
  getCurrentUser(): User | null {
    return this.currentUser();
  }
  
  /**
   * 获取用户角色
   */
  getUserRole(): string {
    return this.currentUser()?.role || '';
  }
  
  /**
   * 获取Token
   */
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }
  
  /**
   * 刷新Token
   */
  refreshToken(): Observable<{ token: string }> {
    return this.http.post<{ token: string }>('/api/auth/refresh', {})
      .pipe(
        tap(response => {
          localStorage.setItem('auth_token', response.token);
        })
      );
  }
  
  /**
   * 注册
   */
  register(data: {
    username: string;
    email: string;
    password: string;
  }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/api/auth/register', data)
      .pipe(
        tap(response => {
          localStorage.setItem('auth_token', response.token);
          localStorage.setItem('current_user', JSON.stringify(response.user));
          
          this.currentUser.set(response.user);
          this.isLoggedIn.set(true);
        })
      );
  }
}