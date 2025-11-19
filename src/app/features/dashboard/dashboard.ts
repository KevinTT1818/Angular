import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { NgxEchartsModule } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import { BlogService } from '../../core/services/blog.service';
import { Blog } from '../../core/models/blog/blog-module';
import { DateFormatPipe } from '../../shared/pipes/date-format-pipe';

interface StatCard {
  title: string;
  value: number;
  change: number;
  icon: string;
  color: string;
  trend: 'up' | 'down';
}

interface ChartData {
  label: string;
  value: number;
  percentage?: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    DateFormatPipe,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    MatButtonModule,
    NgxEchartsModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit {
  private blogService = inject(BlogService);

  // Signals
  blogs = signal<Blog[]>([]);
  isLoading = signal(false);

  // 日期范围选择 - 默认最近6个月
  startDate = signal<Date>(this.getDefaultStartDate());
  endDate = signal<Date>(new Date());

  // 统计数据
  stats = computed<StatCard[]>(() => {
    const allBlogs = this.blogs();
    const totalViews = allBlogs.reduce((sum, blog) => sum + blog.viewCount, 0);
    const totalLikes = allBlogs.reduce((sum, blog) => sum + blog.likeCount, 0);
    const totalComments = allBlogs.reduce((sum, blog) => sum + blog.commentCount, 0);

    return [
      {
        title: '总博客数',
        value: allBlogs.length,
        change: 12,
        icon: '📝',
        color: '#667eea',
        trend: 'up'
      },
      {
        title: '总浏览量',
        value: totalViews,
        change: 8.5,
        icon: '👁️',
        color: '#f093fb',
        trend: 'up'
      },
      {
        title: '总点赞数',
        value: totalLikes,
        change: 15.3,
        icon: '❤️',
        color: '#4facfe',
        trend: 'up'
      },
      {
        title: '总评论数',
        value: totalComments,
        change: -2.4,
        icon: '💬',
        color: '#43e97b',
        trend: 'down'
      }
    ];
  });

  // 热门博客
  popularBlogs = computed(() => {
    return [...this.blogs()]
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, 5);
  });

  // 最新博客
  recentBlogs = computed(() => {
    return [...this.blogs()]
      .sort((a, b) =>
        new Date(b.publishedAt || b.createdAt).getTime() -
        new Date(a.publishedAt || a.createdAt).getTime()
      )
      .slice(0, 5);
  });

  // 分类统计
  categoryStats = computed<ChartData[]>(() => {
    const blogs = this.blogs();
    const categoryMap = new Map<string, number>();

    blogs.forEach(blog => {
      const categoryName = blog.category.name;
      categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + 1);
    });

    const total = blogs.length || 1;
    return Array.from(categoryMap.entries())
      .map(([label, value]) => ({
        label,
        value,
        percentage: Math.round((value / total) * 100)
      }))
      .sort((a, b) => b.value - a.value);
  });

  // 标签统计
  tagStats = computed<ChartData[]>(() => {
    const blogs = this.blogs();
    const tagMap = new Map<string, number>();

    blogs.forEach(blog => {
      blog.tags.forEach(tag => {
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
      });
    });

    return Array.from(tagMap.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  });

  // 发布状态统计
  publishStats = computed<ChartData[]>(() => {
    const blogs = this.blogs();
    const published = blogs.filter(b => b.isPublished).length;
    const draft = blogs.length - published;
    const total = blogs.length || 1;

    return [
      {
        label: '已发布',
        value: published,
        percentage: Math.round((published / total) * 100)
      },
      {
        label: '草稿',
        value: draft,
        percentage: Math.round((draft / total) * 100)
      }
    ];
  });

  // 月度发布趋势 - 基于选择的日期范围
  monthlyTrend = computed<ChartData[]>(() => {
    const blogs = this.blogs();
    const start = this.startDate();
    const end = this.endDate();
    const monthMap = new Map<string, number>();

    // 生成日期范围内的所有月份
    const months: Array<{ key: string; label: string; fullDate: string }> = [];
    const currentDate = new Date(start);
    const endDate = new Date(end);

    while (currentDate <= endDate) {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const key = `${year}-${String(month).padStart(2, '0')}`;
      const label = `${year}-${String(month).padStart(2, '0')}`;
      const fullDate = `${year}年${month}月`;

      months.push({ key, label, fullDate });
      monthMap.set(key, 0);

      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    // 统计每个月的博客数量
    blogs.forEach(blog => {
      const date = new Date(blog.publishedAt || blog.createdAt);
      if (date >= start && date <= end) {
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (monthMap.has(key)) {
          monthMap.set(key, (monthMap.get(key) || 0) + 1);
        }
      }
    });

    return months.map(({ label, fullDate }) => ({
      label: fullDate,
      value: monthMap.get(label) || 0
    }));
  });

  // ECharts 曲线图配置
  chartOption = computed<EChartsOption>(() => {
    const data = this.monthlyTrend();
    const xAxisData = data.map(item => item.label);
    const seriesData = data.map(item => item.value);

    return {
      title: {
        text: '月度发布趋势',
        left: 'center',
        top: 10,
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: '#ddd',
        borderWidth: 1,
        textStyle: {
          color: '#333'
        },
        formatter: (params: any) => {
          const param = params[0];
          return `${param.name}<br/>发布数量: <strong>${param.value}</strong>`;
        }
      },
      grid: {
        left: '5%',
        right: '5%',
        bottom: '10%',
        top: '20%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: xAxisData,
        boundaryGap: false,
        axisLine: {
          lineStyle: {
            color: '#999'
          }
        },
        axisLabel: {
          rotate: 45,
          interval: 0,
          fontSize: 11
        }
      },
      yAxis: {
        type: 'value',
        name: '发布数量',
        minInterval: 1,
        axisLine: {
          lineStyle: {
            color: '#999'
          }
        },
        splitLine: {
          lineStyle: {
            type: 'dashed',
            color: '#eee'
          }
        }
      },
      series: [
        {
          name: '发布数量',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          itemStyle: {
            color: '#667eea',
            borderWidth: 2,
            borderColor: '#fff'
          },
          lineStyle: {
            width: 3,
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [
                { offset: 0, color: '#667eea' },
                { offset: 1, color: '#764ba2' }
              ]
            }
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(102, 126, 234, 0.3)' },
                { offset: 1, color: 'rgba(118, 75, 162, 0.05)' }
              ]
            }
          },
          data: seriesData,
          emphasis: {
            focus: 'series',
            itemStyle: {
              borderWidth: 3,
              shadowBlur: 10,
              shadowColor: 'rgba(102, 126, 234, 0.5)'
            }
          }
        }
      ],
      animation: true,
      animationDuration: 1000,
      animationEasing: 'cubicOut'
    };
  });

  ngOnInit(): void {
    this.loadDashboardData();
  }

  /**
   * 加载Dashboard数据
   */
  loadDashboardData(): void {
    this.isLoading.set(true);

    this.blogService.getBlogs({ page: 1, limit: 1000 }).subscribe({
      next: (response) => {
        this.blogs.set(response.blogs);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('加载Dashboard数据失败:', error);
        this.isLoading.set(false);
      }
    });
  }

  /**
   * 格式化数字
   */
  formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  /**
   * 获取进度条宽度
   */
  getBarWidth(value: number, max: number): string {
    return `${(value / max) * 100}%`;
  }

  /**
   * 获取最大值（用于图表）
   */
  getMaxValue(data: ChartData[]): number {
    return Math.max(...data.map(d => d.value), 1);
  }

  /**
   * 获取默认开始日期（6个月前）
   */
  private getDefaultStartDate(): Date {
    const date = new Date();
    date.setMonth(date.getMonth() - 6);
    date.setDate(1); // 设置为月初
    date.setHours(0, 0, 0, 0);
    return date;
  }

  /**
   * 开始日期改变处理
   */
  onStartDateChange(date: Date | null): void {
    if (date) {
      this.startDate.set(date);
      console.log('开始日期已更新:', date);
    }
  }

  /**
   * 结束日期改变处理
   */
  onEndDateChange(date: Date | null): void {
    if (date) {
      this.endDate.set(date);
      console.log('结束日期已更新:', date);
    }
  }

  /**
   * 重置日期范围到默认值（最近6个月）
   */
  resetDateRange(): void {
    this.startDate.set(this.getDefaultStartDate());
    this.endDate.set(new Date());
  }
}
