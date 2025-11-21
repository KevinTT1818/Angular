import { Component, OnInit, OnDestroy, NgZone, ElementRef, ViewChild, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  color: string;
}

@Component({
  selector: 'app-particles',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <canvas
      #particlesCanvas
      class="particles-canvas">
    </canvas>
  `,
  styles: [`
    .particles-canvas {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
      opacity: 1.0;
      background: rgba(0, 0, 0, 0.2);
    }
  `]
})
export class ParticlesComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('particlesCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private animationId?: number;
  private isDestroyed = false;
  private frameCount = 0;
  private mouseX: number = 0;
  private mouseY: number = 0;
  private mouseInfluence = true; // 默认启用鼠标影响

  // 配置参数
  private readonly PARTICLE_COUNT = 100;
  private readonly MAX_DISTANCE = 150;
  private readonly PARTICLE_SIZE = 2;
  private readonly SPEED = 0.3;
  private readonly Z_RANGE = 1000;
  private readonly MOUSE_RADIUS = 200; // 鼠标影响范围（像素）
  private readonly MOUSE_FORCE = 1.2; // 鼠标吸引力强度（增强效果）

  constructor(private ngZone: NgZone) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    console.log('Particles: ngAfterViewInit called');

    // 确保Canvas元素已经渲染
    if (!this.canvasRef || !this.canvasRef.nativeElement) {
      console.error('Particles: Canvas element not found');
      return;
    }

    console.log('Particles: Canvas element found');
    this.canvas = this.canvasRef.nativeElement;
    console.log('Particles: Canvas size:', this.canvas.width, 'x', this.canvas.height);

    const context = this.canvas.getContext('2d');

    if (!context) {
      console.error('Particles: Failed to get 2D context');
      return;
    }

    this.ctx = context;
    console.log('Particles: 2D context obtained');

    this.initCanvas();
    console.log('Particles: Canvas initialized');

    this.createParticles();
    console.log('Particles: Particles created, count:', this.particles.length);

    // 在 Angular zone 外运行动画，避免触发变更检测
    this.ngZone.runOutsideAngular(() => {
      this.animate();
      console.log('Particles: Animation started');

      // 窗口大小改变时重新初始化
      window.addEventListener('resize', this.handleResize);

      // 添加鼠标移动监听（使用 document 而不是 window）
      document.addEventListener('mousemove', this.handleMouseMove);
      console.log('Particles: Mouse event listener added');
    });

    console.log('✅ Particles component initialized successfully');
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    window.removeEventListener('resize', this.handleResize);
    document.removeEventListener('mousemove', this.handleMouseMove);
  }

  private handleResize = (): void => {
    this.initCanvas();
  };

  private handleMouseMove = (event: MouseEvent): void => {
    const dpr = window.devicePixelRatio || 1;
    this.mouseX = event.clientX * dpr;
    this.mouseY = event.clientY * dpr;

    // 增加帧计数并输出调试信息
    this.frameCount++;
    if (this.frameCount % 100 === 0) {
      console.log('Mouse at:', Math.round(this.mouseX), Math.round(this.mouseY), 'Influence:', this.mouseInfluence);
    }
  };

  private initCanvas(): void {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();

    console.log('initCanvas: rect size', rect.width, 'x', rect.height);
    console.log('initCanvas: dpr', dpr);

    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;

    console.log('initCanvas: canvas size', this.canvas.width, 'x', this.canvas.height);

    // 重置变换矩阵，避免scale累积
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    // 然后应用新的scale
    this.ctx.scale(dpr, dpr);

    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;

    console.log('initCanvas: style size', this.canvas.style.width, 'x', this.canvas.style.height);
  }

  private createParticles(): void {
    this.particles = [];
    const width = this.canvas.width;
    const height = this.canvas.height;

    // 彩色方案
    const colors = [
      '#FF6B6B', // 红色
      '#4ECDC4', // 青色
      '#45B7D1', // 蓝色
      '#FFA07A', // 橙色
      '#98D8C8', // 薄荷绿
      '#F7DC6F', // 黄色
      '#BB8FCE', // 紫色
      '#85C1E2', // 天蓝色
      '#F8B500', // 金黄色
      '#FF69B4'  // 粉色
    ];

    for (let i = 0; i < this.PARTICLE_COUNT; i++) {
      this.particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * this.Z_RANGE,
        vx: (Math.random() - 0.5) * this.SPEED,
        vy: (Math.random() - 0.5) * this.SPEED,
        vz: (Math.random() - 0.5) * this.SPEED,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
  }

  private updateParticles(): void {
    const width = this.canvas.width;
    const height = this.canvas.height;

    for (const particle of this.particles) {
      // 鼠标影响
      if (this.mouseInfluence) {
        const dx = this.mouseX - particle.x;
        const dy = this.mouseY - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.MOUSE_RADIUS * window.devicePixelRatio) {
          // 计算吸引力
          const force = (1 - distance / (this.MOUSE_RADIUS * window.devicePixelRatio)) * this.MOUSE_FORCE;
          particle.vx += (dx / distance) * force;
          particle.vy += (dy / distance) * force;

          // 限制速度
          const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
          const maxSpeed = this.SPEED * 3;
          if (speed > maxSpeed) {
            particle.vx = (particle.vx / speed) * maxSpeed;
            particle.vy = (particle.vy / speed) * maxSpeed;
          }
        }
      }

      // 更新位置
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.z += particle.vz;

      // 添加阻尼，让粒子逐渐恢复原速
      particle.vx *= 0.98;
      particle.vy *= 0.98;
      particle.vz *= 0.98;

      // 如果速度太慢，添加随机扰动
      if (Math.abs(particle.vx) < this.SPEED * 0.5) {
        particle.vx += (Math.random() - 0.5) * this.SPEED * 0.1;
      }
      if (Math.abs(particle.vy) < this.SPEED * 0.5) {
        particle.vy += (Math.random() - 0.5) * this.SPEED * 0.1;
      }

      // 边界检查并反弹
      if (particle.x < 0 || particle.x > width) {
        particle.vx *= -1;
        particle.x = Math.max(0, Math.min(width, particle.x));
      }
      if (particle.y < 0 || particle.y > height) {
        particle.vy *= -1;
        particle.y = Math.max(0, Math.min(height, particle.y));
      }
      if (particle.z < 0 || particle.z > this.Z_RANGE) {
        particle.vz *= -1;
        particle.z = Math.max(0, Math.min(this.Z_RANGE, particle.z));
      }
    }
  }

  private drawParticles(): void {
    for (const particle of this.particles) {
      // 根据 z 坐标计算透视效果
      const scale = (this.Z_RANGE - particle.z) / this.Z_RANGE;
      const size = this.PARTICLE_SIZE * scale * 3; // 增加粒子大小
      const opacity = 0.6 + scale * 0.4; // 增加不透明度

      // 计算与鼠标的距离，用于增强发光效果
      let glowIntensity = 0;
      if (this.mouseInfluence) {
        const dx = this.mouseX - particle.x;
        const dy = this.mouseY - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < this.MOUSE_RADIUS * window.devicePixelRatio) {
          glowIntensity = 1 - distance / (this.MOUSE_RADIUS * window.devicePixelRatio);
        }
      }

      // 绘制粒子
      this.ctx.beginPath();
      this.ctx.arc(
        particle.x / window.devicePixelRatio,
        particle.y / window.devicePixelRatio,
        size,
        0,
        Math.PI * 2
      );

      // 使用粒子的彩色，透明度结合不透明度和发光强度
      const finalOpacity = opacity * (1 + glowIntensity * 0.5);

      // 解析颜色并添加透明度
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : { r: 255, g: 255, b: 255 };
      };

      const rgb = hexToRgb(particle.color);
      this.ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${finalOpacity})`;
      this.ctx.fill();

      // 如果靠近鼠标，添加额外的发光效果
      if (glowIntensity > 0.3) {
        this.ctx.shadowBlur = 15 * glowIntensity;
        this.ctx.shadowColor = particle.color;
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
      }
    }
  }

  private drawConnections(): void {
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const dz = this.particles[i].z - this.particles[j].z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (distance < this.MAX_DISTANCE * window.devicePixelRatio) {
          const opacity = (1 - distance / (this.MAX_DISTANCE * window.devicePixelRatio)) * 0.5;

          // 使用渐变色连接线
          const gradient = this.ctx.createLinearGradient(
            this.particles[i].x / window.devicePixelRatio,
            this.particles[i].y / window.devicePixelRatio,
            this.particles[j].x / window.devicePixelRatio,
            this.particles[j].y / window.devicePixelRatio
          );

          // 解析颜色并添加到渐变
          const hexToRgba = (hex: string, alpha: number) => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            if (!result) return `rgba(255, 255, 255, ${alpha})`;
            const r = parseInt(result[1], 16);
            const g = parseInt(result[2], 16);
            const b = parseInt(result[3], 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
          };

          gradient.addColorStop(0, hexToRgba(this.particles[i].color, opacity));
          gradient.addColorStop(1, hexToRgba(this.particles[j].color, opacity));

          this.ctx.beginPath();
          this.ctx.moveTo(
            this.particles[i].x / window.devicePixelRatio,
            this.particles[i].y / window.devicePixelRatio
          );
          this.ctx.lineTo(
            this.particles[j].x / window.devicePixelRatio,
            this.particles[j].y / window.devicePixelRatio
          );
          this.ctx.strokeStyle = gradient;
          this.ctx.lineWidth = 0.5;
          this.ctx.stroke();
        }
      }
    }
  }

  private animate = (): void => {
    if (this.isDestroyed) {
      return;
    }

    // 清空画布
    this.ctx.clearRect(
      0,
      0,
      this.canvas.width / window.devicePixelRatio,
      this.canvas.height / window.devicePixelRatio
    );

    // 更新和绘制
    this.updateParticles();
    this.drawConnections();
    this.drawParticles();

    // 继续动画
    this.animationId = requestAnimationFrame(this.animate);
  };
}
