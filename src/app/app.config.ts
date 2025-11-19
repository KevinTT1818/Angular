import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideMarkdown } from 'ngx-markdown';
import { provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, TitleComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { routes } from './app.routes';
import { apiInterceptor } from './core/interceptor/api.interceptor';
import { errorInterceptor } from './core/interceptor/error-interceptor';

// 注册 ECharts 组件
echarts.use([LineChart, GridComponent, TooltipComponent, TitleComponent, CanvasRenderer]);

export const appConfig: ApplicationConfig = {
  providers: [
    // Zone.js优化
    provideZoneChangeDetection({ eventCoalescing: true }),
    
    // 路由配置
    provideRouter(
      routes,
      withComponentInputBinding(),  // 允许路由参数直接绑定到组件输入
      withViewTransitions(),         // 启用视图过渡动画
      withInMemoryScrolling({        // 滚动行为配置
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled'
      })
    ),
    
    // HTTP客户端配置
    provideHttpClient(
      withInterceptors([apiInterceptor, errorInterceptor]),
      withFetch()  // 使用Fetch API（性能更好）
    ),
    
    // 动画
    provideAnimations(),

    // Markdown配置
    provideMarkdown(),

    // ECharts配置
    provideEchartsCore({ echarts })
  ]
};