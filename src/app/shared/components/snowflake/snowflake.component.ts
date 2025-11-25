import { Component, OnInit, OnDestroy, NgZone, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationStart } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

interface Snowflake {
  id: number;
  left: number;
  animationDuration: number;
  animationDelay: number;
  fontSize: number;
  opacity: number;
}

@Component({
  selector: 'app-snowflake',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="snowflake-container">
      @for (snowflake of snowflakes; track snowflake.id) {
        <div
          class="snowflake"
          [style.left.%]="snowflake.left"
          [style.animation-duration.s]="snowflake.animationDuration"
          [style.animation-delay.s]="snowflake.animationDelay"
          [style.font-size.px]="snowflake.fontSize"
          [style.opacity]="snowflake.opacity">
          ❄
        </div>
      }
    </div>
  `,
  styles: [`
    .snowflake-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
      overflow: hidden;
      will-change: transform;
    }

    .snowflake {
      position: absolute;
      top: -10%;
      color: #fff;
      user-select: none;
      pointer-events: none;
      animation: fall linear infinite;
      text-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
      will-change: transform;
    }

    @keyframes fall {
      0% {
        transform: translateY(0) rotate(0deg);
      }
      100% {
        transform: translateY(110vh) rotate(360deg);
      }
    }
  `]
})
export class SnowflakeComponent implements OnInit, OnDestroy {
  snowflakes: Snowflake[] = [];
  private readonly SNOWFLAKE_COUNT = 35; // 降低数量以提升性能
  private intervalId?: number;
  private routerSubscription?: Subscription;
  private isDestroyed = false;
  private isNavigating = false;

  constructor(
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    // 在 Angular zone 外运行，避免触发不必要的变更检测
    this.ngZone.runOutsideAngular(() => {
      this.createSnowflakes();

      // 使用更长的间隔减少性能开销
      this.intervalId = window.setInterval(() => {
        if (!this.isDestroyed && !this.isNavigating) {
          this.refreshSnowflakes();
        }
      }, 5000); // 从3秒改为5秒
    });

    // 监听路由导航，在导航期间暂停更新
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationStart))
      .subscribe(() => {
        this.isNavigating = true;
        // 导航完成后500ms恢复更新
        setTimeout(() => {
          this.isNavigating = false;
        }, 500);
      });
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }

    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
      this.routerSubscription = undefined;
    }
  }

  private createSnowflakes(): void {
    this.snowflakes = Array.from({ length: this.SNOWFLAKE_COUNT }, (_, i) =>
      this.generateSnowflake(i)
    );

    // 只在创建时触发一次变更检测
    this.ngZone.run(() => {
      this.cdr.markForCheck();
    });
  }

  private generateSnowflake(id: number): Snowflake {
    return {
      id,
      left: Math.random() * 100,
      animationDuration: 8 + Math.random() * 12, // 8-20秒，让动画更平缓
      animationDelay: Math.random() * 5,
      fontSize: 12 + Math.random() * 18, // 12-30px
      opacity: 0.4 + Math.random() * 0.6 // 0.4-1.0
    };
  }

  private refreshSnowflakes(): void {
    if (this.isDestroyed || this.isNavigating) {
      return;
    }

    // 随机更新20%的雪花，降低更新频率
    const count = Math.floor(this.SNOWFLAKE_COUNT * 0.2);
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * this.SNOWFLAKE_COUNT);
      this.snowflakes[randomIndex] = this.generateSnowflake(randomIndex);
    }

    // 在 Angular zone 内触发变更检测
    this.ngZone.run(() => {
      this.cdr.markForCheck();
    });
  }
}
