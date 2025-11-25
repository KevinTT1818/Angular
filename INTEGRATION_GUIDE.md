# 前后端集成指南

本指南将帮助您完成 Angular 前端与 NestJS 后端的集成和测试。

## ✅ 已完成的工作

### 后端 (NestJS + Prisma + PostgreSQL)
- ✅ 完整的 REST API 实现
- ✅ 数据库模型设计（User, Blog, Category, Tag, Comment）
- ✅ CORS 配置（已允许 http://localhost:4201）
- ✅ 数据验证和错误处理
- ✅ Seed 脚本（9篇博客，5个分类，25个标签）

### 前端 (Angular 20)
- ✅ 环境配置更新（`useMockData: false`）
- ✅ BlogService 适配后端 API 响应格式
- ✅ HTTP 错误处理和重试机制
- ✅ 自动 API 切换（Mock ⇄ 真实 API）

## 🚀 启动步骤

### 第一步：启动后端服务器

```bash
# 1. 进入后端目录
cd /Users/mac/Desktop/SoftWare/Project/Angular/blog-backend

# 2. 确保 PostgreSQL 正在运行
# macOS (Homebrew):
brew services start postgresql
brew services start postgresql@14
brew services restart postgresql@14

# 检查 PostgreSQL 状态
brew services list | grep postgresql

# 3. 创建数据库（首次运行）
createdb blog_db

# 4. 运行数据库迁移（首次运行或 schema 变更后）
npm run prisma:migrate
# 提示输入迁移名称时，输入: init

# 5. 填充测试数据（首次运行或需要重置数据时）
npm run prisma:seed

# 6. 启动开发服务器
npm run start:dev
```

**预期输出：**
```
✅ Prisma connected to database
🚀 Blog API server is running on: http://localhost:3000/api
📝 Swagger docs available at: http://localhost:3000/api/docs
```

### 第二步：启动前端服务器

```bash
# 1. 新开一个终端窗口
# 2. 进入前端目录
cd /Users/mac/Desktop/SoftWare/Project/Angular/blog-system

# 3. 启动 Angular 开发服务器
npm start

# 或者使用特定端口
npm start -- --port 4201
```

**预期输出：**
```
✔ Browser application bundle generation complete.
Initial Chunk Files   | Names         |  Size
...
** Angular Live Development Server is listening on localhost:4201, open your browser on http://localhost:4201/ **
```

### 第三步：验证集成

打开浏览器访问：**http://localhost:4201**

## 🧪 测试检查清单

### 1. 首页测试
- [ ] **最新文章轮播** - 应显示 9 篇博客的轮播
- [ ] **轮播自动播放** - 5秒后自动切换
- [ ] **轮播导航** - 左右箭头和分页点可点击
- [ ] **封面图片加载** - 所有博客应显示 Unsplash 图片
- [ ] **分类显示** - 显示正确的分类名称
- [ ] **点击博客** - 点击卡片应跳转到详情页

### 2. 博客列表页测试 (`/blogs`)
- [ ] **博客列表显示** - 应显示所有博客（默认10条/页）
- [ ] **分页功能** - 分页按钮正常工作
- [ ] **分类筛选** - 左侧分类列表点击后正确筛选
- [ ] **标签筛选** - 标签云点击后正确筛选
- [ ] **搜索功能** - 搜索框输入关键词正确搜索
- [ ] **排序功能** - 最新/最热/标题排序正常工作
- [ ] **热门文章** - 右侧显示浏览量最高的文章
- [ ] **筛选组合** - 多个筛选条件可以组合使用

### 3. 博客详情页测试 (`/blog/:id`)
- [ ] **内容显示** - 完整显示博客标题、内容、封面图
- [ ] **作者信息** - 显示作者名称和头像
- [ ] **统计信息** - 浏览量、点赞数、评论数正确显示
- [ ] **浏览量增加** - 每次访问浏览量自动 +1
- [ ] **点赞功能** - 点赞按钮点击后数量增加
- [ ] **标签显示** - 显示所有关联标签
- [ ] **分类显示** - 显示所属分类

### 4. 仪表板测试 (`/dashboard`)
- [ ] **统计卡片** - 显示博客总数、分类数、总浏览量等
- [ ] **月度趋势图** - ECharts 曲线图正确显示
- [ ] **日期选择器** - 可选择起止日期查看趋势
- [ ] **数据更新** - 选择日期后图表动态更新

### 5. 浏览器控制台检查

打开浏览器开发者工具（F12），切换到 **Network** 标签：

#### 应该看到的 API 请求：

**首页：**
```
GET http://localhost:3000/api/blogs/recent?limit=9
Status: 200
Response: [{ id, title, content, coverImage, ... }]
```

**博客列表：**
```
GET http://localhost:3000/api/blogs?page=1&limit=10
Status: 200
Response: { blogs: [...], total: 9, page: 1, limit: 10, totalPages: 1 }

GET http://localhost:3000/api/categories
Status: 200
Response: [{ id, name, description, blogCount, ... }]

GET http://localhost:3000/api/blogs/popular?limit=5
Status: 200
Response: [{ id, title, viewCount, ... }]
```

**博客详情：**
```
GET http://localhost:3000/api/blogs/[blog-id]
Status: 200
Response: { id, title, content, ... }

POST http://localhost:3000/api/blogs/[blog-id]/like
Status: 200
Response: { id, title, likeCount: 增加后的数量, ... }
```

#### 不应该看到的：
- ❌ CORS 错误
- ❌ 404 错误（路径不存在）
- ❌ 500 错误（服务器错误）
- ❌ 网络超时

## 🐛 常见问题排查

### 问题 1：CORS 错误
```
Access to XMLHttpRequest at 'http://localhost:3000/api/blogs' from origin 'http://localhost:4201' has been blocked by CORS policy
```

**解决方案：**
1. 检查后端是否正在运行
2. 检查后端 `.env` 文件中 `CORS_ORIGIN` 设置
3. 重启后端服务器

### 问题 2：连接被拒绝
```
ERR_CONNECTION_REFUSED
```

**解决方案：**
1. 确认后端服务器正在运行（检查终端输出）
2. 确认端口 3000 没有被其他程序占用
3. 检查防火墙设置

### 问题 3：数据库连接失败
```
❌ Error: connect ECONNREFUSED 127.0.0.1:5432
```

**解决方案：**
```bash
# 启动 PostgreSQL
brew services start postgresql

# 检查状态
brew services list

# 如果数据库不存在，创建它
createdb blog_db

# 重新运行迁移
cd blog-backend
npm run prisma:migrate
```

### 问题 4：页面显示空白或"加载中..."
**可能原因：**
- API 响应格式不匹配
- 数据库中没有数据
- JavaScript 错误

**解决方案：**
1. 打开浏览器控制台查看错误信息
2. 检查 Network 标签中的 API 响应
3. 确认数据库中有数据：
```bash
cd blog-backend
npx prisma studio
# 访问 http://localhost:5555 查看数据
```

### 问题 5：图片无法加载
**可能原因：**
- Unsplash 图片被墙或加载慢
- 网络问题

**临时解决方案：**
- 图片加载失败会自动显示渐变色占位图
- 或者在后端 seed 脚本中使用本地图片URL

## 📊 API 响应格式对照

### 后端实际返回格式：

**获取博客列表：**
```json
{
  "blogs": [{ id, title, ... }],
  "total": 9,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

**获取单个博客：**
```json
{
  "id": "uuid",
  "title": "标题",
  "content": "内容",
  "category": { "id": "uuid", "name": "分类名" },
  "tags": ["tag1", "tag2"],
  ...
}
```

**获取分类列表：**
```json
[
  {
    "id": "uuid",
    "name": "分类名",
    "description": "描述",
    "blogCount": 5
  }
]
```

## 🎯 下一步建议

### 已完成 ✅
- [x] 后端 API 实现
- [x] 前端 Service 适配
- [x] 环境配置
- [x] 数据填充

### 可选功能（按需实现）
- [ ] **JWT 认证** - 实现登录/注册功能
- [ ] **评论功能** - 实现博客评论 API
- [ ] **图片上传** - 实现博客封面上传
- [ ] **Markdown 编辑器** - 前端集成富文本编辑器
- [ ] **实时搜索** - 实现搜索建议/自动完成
- [ ] **部署** - 部署到生产环境

## 📝 测试用账号

后端 Seed 数据创建了以下测试账号（未来实现认证功能时使用）：

```
管理员账号：
Email: admin@blog.com
Password: password123

普通用户：
Email: user@blog.com
Password: password123
```

## 🔍 查看实际数据

### 使用 Prisma Studio
```bash
cd blog-backend
npx prisma studio
```
访问 **http://localhost:5555** 可以查看和编辑数据库数据

### 使用 API 测试工具
推荐使用 **Postman** 或 **Thunder Client (VS Code插件)** 测试 API：

```
GET http://localhost:3000/api/blogs
GET http://localhost:3000/api/blogs/recent?limit=5
GET http://localhost:3000/api/categories
GET http://localhost:3000/api/tags
POST http://localhost:3000/api/blogs/[id]/like
```

## 📞 需要帮助？

如果遇到问题：
1. 检查浏览器控制台的错误信息
2. 检查后端终端的日志输出
3. 确认两个服务器都在运行
4. 查看本文档的"常见问题排查"部分

---

**集成成功的标志：**
✅ 首页显示 9 篇博客的轮播图
✅ 博客列表显示真实的后端数据
✅ 浏览器控制台没有错误
✅ Network 标签显示成功的 API 请求
