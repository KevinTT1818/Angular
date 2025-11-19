export const environment = {
  production: true,

  // API配置 - 生产环境
  apiUrl: 'https://api.yourdomain.com/api', // 替换为你的生产API地址
  apiVersion: 'v1',

  // 功能开关
  useMockData: false, // 生产环境使用真实API
  enableAuth: true,   // 生产环境启用认证

  // API端点
  endpoints: {
    // 博客相关
    blogs: '/blogs',
    blogDetail: '/blogs/:id',
    createBlog: '/blogs',
    updateBlog: '/blogs/:id',
    deleteBlog: '/blogs/:id',

    // 分类相关
    categories: '/categories',
    categoryDetail: '/categories/:id',

    // 标签相关
    tags: '/tags',
    tagDetail: '/tags/:name',

    // 用户认证
    login: '/auth/login',
    logout: '/auth/logout',
    register: '/auth/register',
    refreshToken: '/auth/refresh',

    // 文件上传
    uploadImage: '/upload/image',
    uploadFile: '/upload/file',

    // 评论
    comments: '/comments',
    commentsByBlog: '/blogs/:id/comments',
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
