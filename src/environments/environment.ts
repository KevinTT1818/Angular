// 动态获取API URL - 根据当前访问地址自动调整
const getApiUrl = (): string => {
  if (typeof window === 'undefined') {
    return 'http://localhost:3000/api';
  }

  const hostname = window.location.hostname;
  const protocol = window.location.protocol;

  // 如果是localhost，使用localhost:3000
  // 否则使用当前主机的IP:3000
  return `${protocol}//${hostname}:3000/api`;
};

export const environment = {
  production: false,

  // API配置
  apiUrl: getApiUrl(),
  apiVersion: 'v1',

  // 功能开关
  useMockData: false, // 设置为 false 使用真实API
  enableAuth: true,  // 是否启用认证

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
  timeout: 30000, // 30秒超时
  retryAttempts: 3,

  // 分页默认值
  pagination: {
    defaultPage: 1,
    defaultPageSize: 10,
    maxPageSize: 100
  }
};