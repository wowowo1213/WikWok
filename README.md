# WikWok

一个简易的视频播放网站，支持视频上传/删除、用户注册/登录/编辑信息、点赞视频/取消点赞视频、新增评论/删除评论、响应式布局等功能。

## 技术栈

### 前端

- **框架**: Nuxt.js + Vue 3
- **语言**: TypeScript
- **样式**: TailwindCSS
- **状态管理**: Pinia
- **其他库**:
  - `Nuxt-ui`
  - `vue-advanced-cropper` (头像裁剪)
  - `axios`

### 后端

- **框架**: Nest.js
- **语言**: TypeScript
- **数据库**: MongoDB
- **安全**:
  - CSRF 防护 (`csrf-csrf`)
  - JWT 信息双 Token 认证
  - CORS 配置 (限制域名、方法、请求头)
- **文件存储**: 本地存储 (支持大文件上传，限制 2GB)

---

## 项目亮点

### 1. 响应式布局

- 使用 TailwindCSS 实现多端适配，不同屏幕尺寸下动态调整布局：
  - 移动端：隐藏侧边栏，简化导航
  - 桌面端：完整展示侧边栏和推荐视频列表
- 使用 IntersactionObserver 进行动态观察来决定视频是否播放

### 2. 用户信息

- 支持新用户注册
- 支持修改头像（使用 `vue-advanced-cropper` 实现裁剪）
- 支持修改昵称和个人简介

### 3. 视频上传与管理

- **前端**：
  - 使用 `FormData` 上传视频文件
  - 支持大文件分片上传 + 秒传 + WebWorker 计算大文件 hash + 断点续传 + 显示上传进度
- **后端**：
  - 解析上传数据并存储到本地 (`WikWok-api/uploads/videos/`)
  - 返回可访问的 URL 路径 (`http://localhost:5000/uploads/videos/xxx.mp4`)

### 4. 安全机制

- **CSRF 防护**：
  - 后端生成 cookie 并验证请求头 `x-csrf-token`
  - 前端在登录/注册前调用 `getCsrfToken()` 获取令牌，检验请求合法性
  - `cookie`跨域的时候设置了自动携带，在`axios`里面设置`credentials: true`
- **JWT 防护**:
  - 后端设置 JWT 防护，进行身份验证，使用双 Token 实现无感刷新，优化用户体验
  - 但是这边后端还需要检验 RefreshToken 的创建时间，使用数据库保存，不然每次重新创建的 RefreshToken 的过期时间也会重置
  - 但是这些都是后端的同学负责了，就暂时不修改了
- **CORS 配置**：
  - 限制允许的请求域名(`http://localhost:3000`)
  - 限制允许的 HTTP 方法 (`GET`, `POST`, `PUT`, `OPTIONS`)
  - 允许携带 Cookie (`credentials: true`)

### 5、axios 实现动态刷新 accessToken

- 请求拦截器：统一注入 Authorization 头（Bearer Token）和 CSRF-TOKEN
- 响应拦截器：捕获 401 状态码，自动触发 accessToken 刷新
- 无感刷新：通过 Promise 队列避免重复刷新请求
- 节流错误处理：统一处理错误提示，避免重复弹窗

### 6、支持新增评论，支持视频点赞等功能

- 主要在后端实现操作数据库逻辑，前端主要负责展示

---

## 快速开始

### 后端启动

后端文件的使用需要到官网下载 MongoDB

```bash
# 进入后端目录
cd WikWok-api

# 安装依赖
npm install

# 配置.env文件
NODE_ENV='production'

# 启动开发服务器 (默认端口 5000)(最好放在5000的端口号，不然前端视频和用户头像的src需要改变端口号)
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

```bash
WikWok/
├── assets/                           # 静态资源 (图片/css 样式)
│   └── worker/                       # WebWorker
├── components/                       # 可复用组件
│   ├── AuthOverlay.vue               # 登录/注册界面
│   ├── EditProfileOverlay.vue        # 编辑个人信息界面
│   ├── Login.vue                     # 登录表单
│   ├── MainView.vue                  # 主页
│   ├── MenuItem.vue                  # 侧边栏的菜单组件
│   ├── MenuItemFollow.vue            # 侧边栏中的推荐用户和关注用户
│   ├── Register.vue                  # 注册表单
│   ├── SideNavMain.vue               # 侧边栏
│   ├── TextInput.vue                 # 输入框组件
│   ├── TopNav.vue                    # 头部导航栏
│   ├── UploadError.vue               # 上传错误信息弹窗
│   └── UserVideo.vue                 # 用户上传视频组件
├── layouts/                          # 布局级组件
├── pages/                            # 页面级组件
│   ├── video/                        # 视频详情界面
│   │   └── [id].vue
│   ├── profile/                      # 用户主页
│   │   └── [id].vue
│   ├── upload/                       # 上传视频界面
│   │   └── index.vue
│   └── index.vue                     # 首页
├── plugins/                          # 插件
│   ├── axios.ts
│   └── store.ts
├── stores/                           # Pinia 状态管理
│   ├── general.ts                    # 通用方法
│   └── user.ts                       # 用户状态
├── utils/                            # Pinia 状态管理
│   └── upload.ts                     # 插件
└── app.vue
```

### 后端结构 (Nest)

```bash
WikWok-api/
├── logs/                             # 日志文件夹
├── public/                           # 静态资源(如默认头像)
├── src/
│   ├── auth/
│   │   ├── auth.controller.ts        # 注册/登录接口，获取csrf-token接口
│   │   ├── auth.dto.ts               # 注册/登录用户信息数据类型
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   └── jwt.strategy.ts           # JWT认证的设置
│   ├── common/                       # 全局过滤器、响应处理器、日志处理、csrf中间件设置
│   ├── upload/                       # 上传视频接口
│   ├── user/
│   │   ├── user.controller.ts        # 用户信息/视频信息/评论信息接口
│   │   ├── user.module.ts
│   │   ├── user.schema.ts
│   │   ├── user.service.ts
│   │   └── user.dto.ts               # 用户信息数据类型
│   ├── app.module.ts
│   └── main.ts                       # 配置跨域和开启csrf的cookie验证
├── uploads/                          # 视频/用户头像上传文件夹
└── .env                              # 环境变量(设置JWT_SECRET、SESSION_SECRET)
```
