import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Header } from './shared/components/header/header';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private router = inject(Router);

  protected readonly title = signal('blog-system');
  protected showHeader = signal(true);

  ngOnInit(): void {
    // 监听路由变化
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // 如果当前路由是登录页，隐藏 header
      this.showHeader.set(!event.url.includes('/login'));
    });

    // 初始化时检查当前路由
    this.showHeader.set(!this.router.url.includes('/login'));
  }
}
