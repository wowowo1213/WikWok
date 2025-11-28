# WikWok

一个简易的仿制 TikTok 的视频播放网站，支持视频上传、用户信息编辑、响应式布局等功能。

## 技术栈

### 前端

- **框架**: Nuxt.js (SSR) + Vue 3
- **语言**: TypeScript
- **样式**: TailwindCSS
- **状态管理**: Pinia
- **其他库**:
  - `vue-advanced-cropper` (头像裁剪)
  - `axios` (HTTP 请求)

### 后端

- **框架**: Next.js (API Routes)
- **语言**: TypeScript
- **数据库**: MongoDB
- **安全**:
  - CSRF 防护 (`csrf-token`)
  - CORS 配置 (限制域名、方法、请求头)
- **文件存储**: 本地存储 (支持大文件上传，限制 2GB)

---

## 项目亮点

### 1. 响应式布局

- 使用 TailwindCSS 实现多端适配
- 不同屏幕尺寸下动态调整布局：
  - 移动端：隐藏侧边栏，简化导航
  - 桌面端：完整展示侧边栏和推荐视频列表

### 2. 搜索框交互

- 模仿 TikTok 官方搜索框样式
- 使用 TailwindCSS 的 `group` 和 `peer` 实现交互效果:鼠标悬停或输入框聚焦时，右侧搜索图标高亮

### 3. 用户信息动态更新

- **注册流程**：
  1. 提交表单后生成用户记录
  2. 返回默认头像（通过服务端生成）
- **编辑功能**：
  - 支持修改头像（使用 `vue-advanced-cropper` 实现裁剪）
  - 支持修改昵称和个人简介
- **数据同步**：
  - `App.vue` 挂载后自动通过 `currentUserId` 获取最新用户数据
  - 使用 Pinia 管理全局状态

### 4. 视频上传与管理

- **前端**：
  - 使用 `FormData` 上传视频文件
  - 显示上传进度条
  - 支持大文件分片上传（断点续传）
- **后端**：
  - 解析上传数据并存储到本地 (`/uploads/videos/`)
  - 返回可访问的 URL 路径 (`http://localhost:5000/uploads/videos/xxx.mp4`)

### 5. 安全机制

- **CSRF 防护**：
  - 后端生成并验证 `csrf-token`
  - 前端在登录/注册前调用 `getToken()` 获取令牌
- **CORS 配置**：
  - 限制允许的请求域名(`http://localhost:3000`)
  - 限制允许的 HTTP 方法 (`GET`, `POST`, `PUT`)
  - 允许携带 Cookie (`credentials: true`)

---

## 快速开始

### 后端启动

```bash
# 进入后端目录
cd WikWok-api

# 安装依赖
npm install

# 启动开发服务器 (默认端口 5000)
npm run start:dev
```

### 前端启动

```bash
# 进入前端目录
cd WikWok

# 安装依赖
npm install

# 启动开发服务器 (默认端口 3000)
npm run dev
```

## 项目结构

### 前端结构 (Nuxt + Vue3)

```
WikWok/
├── assets/ # 静态资源 (图片/css 样式)
├── components/ # 可复用组件
│ ├── AuthOverlay.vue # 登录/注册界面
│ ├── EditProfileOverlay.vue # 编辑个人信息界面
│ ├── Login.vue # 登录表单
│ ├── MainView.vue # 主页的'为你推荐'组件
│ ├── MenuItem.vue # 侧边栏的菜单组件
│ ├── MenuItemFollow.vue # 侧边栏的菜单之后内容的组件
│ ├── Register.vue # 注册表单
│ ├── SideNavMain.vue # 侧边栏
│ ├── TextInput.vue # 输入框组件
│ ├── TopNav.vue # 头部导航栏
│ ├── UploadError.vue # 上传错误信息弹窗
│ └── UserVideo.vue # 用户上传视频组件
├── layouts/ # 布局级组件
├── pages/ # 页面级组件
│ ├── post/
│ │ └── [id].vue
│ ├── profile/ # 用户主页
│ │ └── [id].vue # 动态用户页
│ ├── upload/ # 上传视频界面
│ │ └── index.vue
│ └── index.vue # 首页
├── plugins/ # 插件
│ ├── axios.ts
│ └── store.ts
├── stores/ # Pinia 状态管理
│ ├── general.ts # 设置响应拦截器/通用方法
│ └── user.ts # 用户状态
├── types/ # TypeScript 类型定义
│ └── app-load-state # 用户类型
└── app.vue
```
