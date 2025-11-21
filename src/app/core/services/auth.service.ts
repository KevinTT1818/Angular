import { Injectable, signal, inject, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  TokenPayload,
} from '../models/auth/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  // Storage keys
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'current_user';

  // Signals and Observable
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  currentUser$ = this.currentUserSubject.asObservable();

  currentUser = signal<User | null>(this.getUserFromStorage());
  isAuthenticated = computed(() => !!this.currentUser());
  isAdmin = computed(() => this.currentUser()?.role === 'ADMIN');

  private get apiUrl(): string {
    return environment.apiUrl;
  }

  /**
   * 用户注册
   */
  register(registerData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, registerData).pipe(
      tap((response) => this.handleAuthResponse(response)),
      catchError(this.handleError)
    );
  }

  /**
   * 用户登录
   */
  login(loginData: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, loginData).pipe(
      tap((response) => this.handleAuthResponse(response)),
      catchError(this.handleError)
    );
  }

  /**
   * 用户登出
   */
  logout(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);

    this.currentUser.set(null);
    this.currentUserSubject.next(null);

    this.router.navigate(['/login']);
  }

  /**
   * 刷新 access token
   */
  refreshToken(): Observable<{ accessToken: string }> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<{ accessToken: string }>(`${this.apiUrl}/auth/refresh`, {
      refreshToken,
    }).pipe(
      tap((response) => {
        this.setAccessToken(response.accessToken);
      }),
      catchError((error) => {
        this.logout();
        return throwError(() => error);
      })
    );
  }

  /**
   * 获取当前用户信息
   */
  getCurrentUserInfo(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/auth/me`).pipe(
      tap((user) => {
        this.currentUser.set(user);
        this.currentUserSubject.next(user);
        this.setUser(user);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * 获取 access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  /**
   * 获取 refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * 检查 token 是否过期
   */
  isTokenExpired(token?: string): boolean {
    if (!token) {
      token = this.getAccessToken() || undefined;
    }

    if (!token) {
      return true;
    }

    try {
      const payload = this.decodeToken(token);
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  /**
   * 解码 JWT token
   */
  decodeToken(token: string): TokenPayload {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }

    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  }

  /**
   * 处理认证响应
   */
  private handleAuthResponse(response: AuthResponse): void {
    this.setAccessToken(response.accessToken);
    this.setRefreshToken(response.refreshToken);
    this.setUser(response.user);
    this.currentUser.set(response.user);
    this.currentUserSubject.next(response.user);
  }

  private setAccessToken(token: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
  }

  private setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  private setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private getUserFromStorage(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) {
      return null;
    }

    try {
      return JSON.parse(userStr);
    } catch (error) {
      return null;
    }
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = '发生未知错误';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `错误: ${error.error.message}`;
    } else {
      errorMessage = error.error?.message || error.error?.error || `服务器错误 (${error.status})`;
    }

    console.error('Auth错误:', error);
    return throwError(() => new Error(errorMessage));
  }
}