# Hexo Glasses Theme

Hexo 的现代化二开版本，采用 Next.js + Liquid Glass 主题设计。

## 🌟 特性

- **现代化设计**: 采用 Glassmorphism 玻璃拟态设计
- **液体动画**: 流畅的液体背景动画效果
- **响应式布局**: 完美适配桌面端和移动端
- **动态路由**: 支持美观的 URL 结构 (/slug, /tags, /categories)
- **静态导出**: 高性能的静态站点生成
- **SEO 优化**: 良好的搜索引擎优化支持

## 🚀 技术栈

- **前端框架**: Next.js 14
- **UI 组件**: Framer Motion + Lucide React
- **样式**: Tailwind CSS + CSS Variables
- **内容管理**: Markdown + Gray Matter
- **构建工具**: Static Export

## 📁 项目结构

```
hexo-glasses-theme/
├── app/                    # Next.js App Router
│   ├── [slug]/            # 动态文章页面
│   ├── tags/              # 标签页面
│   ├── categories/        # 分类页面
│   ├── about/             # 关于页面
│   ├── components/        # React 组件
│   └── page.tsx           # 首页
├── source/_posts/         # 博客文章 (Markdown)
├── public/data/           # 博客数据 (JSON)
├── scripts/               # 构建脚本
└── styles/                # 样式文件
```

## 🛠️ 开发

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:3000

### 提取博客数据

从 Hexo 格式的文章提取数据：

```bash
npm run extract-data
```

### 构建生产版本

```bash
npm run build
```

### 清理缓存

```bash
npm run clean
```

## 📝 写作

在 `source/_posts/` 目录下创建 Markdown 文件：

```markdown
---
title: 文章标题
date: 2025-12-22T12:15
tags: ['标签1', '标签2']
categories: ['分类']
layout: post
cover: https://example.com/cover.jpg
---

文章内容...
```

## 🌐 路由结构

- `/` - 首页
- `/hello-world` - 文章详情
- `/tags` - 标签页面
- `/categories` - 分类页面
- `/about` - 关于页面

## 🎨 主题配置

主题样式通过 CSS Variables 控制，支持：

- 深色/浅色模式
- 玻璃拟态效果
- 自定义主题色
- 动画效果

## 📤 部署

### GitHub Pages

1. 推送到 `main` 分支
2. 在 GitHub 仓库设置中启用 GitHub Pages
3. 选择部署源为 GitHub Actions

### 手动部署

```bash
npm run build
# 将 out 目录部署到服务器
```

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issues 和 Pull Requests！

---

基于 [Hexo](https://hexo.io/) 框架二开开发
