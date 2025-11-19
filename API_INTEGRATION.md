# API 集成文档

本文档说明如何将博客系统连接到真实的后端API。

## 目录
- [快速开始](#快速开始)
- [环境配置](#环境配置)
- [API端点说明](#api端点说明)
- [后端API规范](#后端api规范)
- [切换到真实API](#切换到真实api)
- [认证与授权](#认证与授权)
- [错误处理](#错误处理)
- [示例后端实现](#示例后端实现)

## 快速开始

### 1. 配置API地址

编辑 `src/environments/environment.ts`：

```typescript
export const environment = {
  production: false,

  // 修改为你的API地址
  apiUrl: 'http://localhost:3000/api',

  // 关闭Mock数据，启用真实API
  useMockData: false,

  // 如需认证，启用此选项
  enableAuth: true,
};
```

### 2. 启动后端服务器

确保你的后端API服务器运行在 `http://localhost:3000` (或你配置的地址)。

### 3. 启动前端应用

```bash
npm start
```

## 环境配置

### 开发环境 (environment.ts)

```typescript
export const environment = {
  production: false,

  // API配置
  apiUrl: 'http://localhost:3000/api',
  apiVersion: 'v1',

  // 功能开关
  useMockData: false,  // false = 使用真实API
  enableAuth: true,    // 是否启用JWT认证

  // API端点配置
  endpoints: {
    blogs: '/blogs',
    categories: '/categories',
    uploadImage: '/upload/image',
    login: '/auth/login',
    // ... 更多端点
  },

  // 请求配置
  timeout: 30000,
  retryAttempts: 3,

  // 分页默认值
  pagination: {
    defaultPage: 1,
    defaultPageSize: 10,
    maxPageSize: 100
  }
};
```

### 生产环境 (environment.prod.ts)

```typescript
export const environment = {
  production: true,

  // 生产API地址
  apiUrl: 'https://api.yourdomain.com/api',
  useMockData: false,
  enableAuth: true,

  // ... 其他配置
};
```

## API端点说明

### 博客相关

| 方法 | 端点 | 说明 | 请求体 |
|------|------|------|--------|
| GET | `/api/blogs` | 获取博客列表 | - |
| GET | `/api/blogs/:id` | 获取博客详情 | - |
| POST | `/api/blogs` | 创建博客 | Blog对象 |
| PUT | `/api/blogs/:id` | 更新博客 | Blog对象 |
| DELETE | `/api/blogs/:id` | 删除博客 | - |
| GET | `/api/blogs/search?q=query` | 搜索博客 | - |
| GET | `/api/blogs/popular?limit=5` | 获取热门博客 | - |
| GET | `/api/blogs/recent?limit=5` | 获取最新博客 | - |
| POST | `/api/blogs/:id/view` | 增加浏览量 | - |
| POST | `/api/blogs/:id/like` | 点赞 | - |

### 分类相关

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/categories` | 获取分类列表 |
| GET | `/api/categories/:id` | 获取分类详情 |

### 文件上传

| 方法 | 端点 | 说明 | Content-Type |
|------|------|------|--------------|
| POST | `/api/upload/image` | 上传图片 | multipart/form-data |

### 认证相关

| 方法 | 端点 | 说明 |
|------|------|------|
| POST | `/api/auth/login` | 登录 |
| POST | `/api/auth/logout` | 登出 |
| POST | `/api/auth/register` | 注册 |
| POST | `/api/auth/refresh` | 刷新Token |

## 后端API规范

### 1. 统一响应格式

所有API响应应遵循以下格式：

```typescript
{
  "success": true,
  "data": any,        // 实际数据
  "message": "string" // 可选的消息
}
```

**成功响应示例：**

```json
{
  "success": true,
  "data": {
    "id": "123",
    "title": "我的博客",
    "content": "博客内容..."
  }
}
```

**错误响应示例：**

```json
{
  "success": false,
  "error": "博客不存在",
  "message": "未找到ID为123的博客"
}
```

### 2. 分页响应格式

```json
{
  "success": true,
  "data": {
    "data": [...],      // 数据数组
    "total": 100,       // 总记录数
    "page": 1,          // 当前页码
    "pageSize": 10,     // 每页大小
    "totalPages": 10    // 总页数
  }
}
```

### 3. Blog数据结构

```typescript
interface Blog {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  categoryId: string;
  tags: string[];
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  viewCount: number;
  likeCount: number;
  commentCount: number;
  isPublished: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  seo: {
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string[];
  };
}
```

### 4. 图片上传响应

```json
{
  "success": true,
  "data": {
    "url": "https://cdn.example.com/images/xxx.jpg",
    "fileName": "image_1234567890_abc123.jpg",
    "size": 102400,
    "width": 1920,
    "height": 1080
  }
}
```

## 切换到真实API

### 步骤1: 修改环境配置

```typescript
// src/environments/environment.ts
export const environment = {
  ...
  useMockData: false,  // 改为 false
  ...
};
```

### 步骤2: 配置API地址

```typescript
apiUrl: 'http://your-api-domain.com/api',
```

### 步骤3: 重启应用

```bash
npm start
```

### 步骤4: 验证连接

打开浏览器控制台，检查网络请求：
- 应该看到真实的HTTP请求
- 检查请求URL是否正确
- 检查响应状态码和数据格式

## 认证与授权

### JWT认证流程

1. **用户登录**
```typescript
// 登录请求
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

// 响应
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "1",
      "name": "用户名",
      "email": "user@example.com"
    }
  }
}
```

2. **存储Token**
前端自动将token存储在localStorage:
```typescript
localStorage.setItem('auth_token', token);
```

3. **自动附加Token**
HTTP拦截器会自动在请求头中添加：
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### 配置认证

在 `environment.ts` 中启用认证：

```typescript
enableAuth: true,
```

拦截器会自动处理：
- ✅ 添加Authorization头
- ✅ Token过期刷新
- ✅ 401错误重定向到登录页

## 错误处理

### 常见错误码

| 状态码 | 说明 | 处理方式 |
|--------|------|----------|
| 400 | 请求参数错误 | 检查请求数据格式 |
| 401 | 未授权 | 重新登录 |
| 403 | 禁止访问 | 检查权限 |
| 404 | 资源不存在 | 显示404页面 |
| 500 | 服务器错误 | 显示错误提示 |

### 错误处理示例

```typescript
// 服务会自动处理错误
this.blogService.getBlogById('123').subscribe({
  next: (blog) => {
    console.log('博客数据:', blog);
  },
  error: (error) => {
    // 错误已被服务处理并转换为友好消息
    console.error('错误:', error.message);
    // 可以显示toast提示
    this.showError(error.message);
  }
});
```

### 重试机制

API请求会自动重试（配置在environment中）：

```typescript
retryAttempts: 3,  // 失败后重试3次
```

## 示例后端实现

### Node.js + Express 示例

```javascript
// server.js
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// 获取博客列表
app.get('/api/blogs', async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;

  try {
    const blogs = await Blog.find()
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await Blog.countDocuments();

    res.json({
      success: true,
      data: {
        data: blogs,
        total,
        page: parseInt(page),
        pageSize: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 创建博客
app.post('/api/blogs', async (req, res) => {
  try {
    const blog = await Blog.create(req.body);
    res.json({
      success: true,
      data: blog
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// 上传图片
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

app.post('/api/upload/image', upload.single('image'), async (req, res) => {
  try {
    const file = req.file;
    const url = `https://yourcdn.com/${file.filename}`;

    res.json({
      success: true,
      data: {
        url,
        fileName: file.originalname,
        size: file.size
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(3000, () => {
  console.log('API服务器运行在 http://localhost:3000');
});
```

## 测试API集成

### 使用Postman测试

1. **测试博客列表**
```
GET http://localhost:3000/api/blogs?page=1&limit=10
```

2. **测试创建博客**
```
POST http://localhost:3000/api/blogs
Content-Type: application/json

{
  "title": "测试博客",
  "content": "这是内容",
  "excerpt": "这是摘要",
  "categoryId": "1",
  "tags": ["测试"]
}
```

3. **测试图片上传**
```
POST http://localhost:3000/api/upload/image
Content-Type: multipart/form-data

[选择文件: image]
```

## 常见问题

### Q: CORS错误怎么办？
A: 确保后端配置了CORS:
```javascript
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));
```

### Q: 如何调试API请求？
A:
1. 打开浏览器开发者工具
2. 进入Network标签
3. 筛选XHR请求
4. 检查请求和响应

### Q: Token过期怎么处理？
A: 拦截器会自动检测401错误并：
1. 尝试刷新token
2. 如果刷新失败，重定向到登录页

### Q: 如何临时禁用API使用Mock数据？
A: 修改environment.ts:
```typescript
useMockData: true,  // 改回 true
```

## 下一步

- [ ] 部署后端API服务器
- [ ] 配置CDN用于图片存储
- [ ] 添加API监控和日志
- [ ] 实现缓存策略
- [ ] 配置负载均衡

## 支持

如有问题，请查看：
- [Angular HttpClient文档](https://angular.io/guide/http)
- [RxJS操作符文档](https://rxjs.dev/guide/operators)
- 项目Issues: https://github.com/your-repo/issues
