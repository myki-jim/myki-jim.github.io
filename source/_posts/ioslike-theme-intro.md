---
title: iOSlike - 仿 iOS 风格的 Next.js 博客主题
date: 2025-12-27 12:00:00
tags: ['Next.js', '博客', '主题', 'iOS', 'React']
categories: ['技术', '开源']
cover: /images/screenshots/screenshot-home.png
author: Jimmy Ki
---

# 介绍

iOSlike 是一个仿 iOS 风格的 Next.js 博客主题，采用玻璃拟态设计（Glassmorphism），具有流畅的动画和现代化的界面。

![博客首页](/images/screenshots/screenshot-home.png)

## 特性

### 1. 玻璃拟态设计
- 半透明毛玻璃效果
- 模糊背景（Blur 效果）
- 流畅的过渡动画

### 2. 搜索功能
- 全局搜索（Ctrl/Cmd + F）
- 支持搜索文章、页面、工具、标签
- 搜索结果高亮显示

![搜索功能](/images/screenshots/screenshot-search.png)

### 3. 图片优化
- 懒加载（Lazy Loading）
- 点击放大查看（Lightbox）
- 模糊过渡效果

### 4. 骨架屏加载
- 无限滚动加载
- 加载占位符动画
- 提升用户体验

### 5. 开发工具箱
内置 12+ 实用工具：

![工具箱](/images/screenshots/screenshot-tools.png)

| 工具 | 功能 |
|------|------|
| 正则测试器 | 实时测试正则表达式 |
| 哈希生成器 | MD5、SHA-1/256 等 |
| 编解码转换器 | Base64、URL、HTML 等 |
| JSON 格式化器 | 格式化、验证 JSON |
| UUID 生成器 | 批量生成 UUID v4 |
| RSA 密钥生成器 | 生成 RSA 密钥对 |
| 密码生成器 | 安全随机密码 |
| Markdown 编辑器 | 实时预览 |
| 二维码生成器 | 多种格式支持 |
| Mermaid 图表 | 流程图、时序图 |
| UML 图表设计器 | UML 建模 |
| 2048 游戏 | 经典益智游戏 |

## 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **动画**: Framer Motion
- **图标**: Lucide React
- **Markdown**: React Markdown + Syntax Highlighter

## 快速开始

### 1. Fork 本项目

```bash
# 访问 https://github.com/myki-jim/myki-jim.github.io
# 点击 Fork 并重命名为 yourname.github.io
```

### 2. 修改个人信息

```bash
# 修改 Sidebar 信息
编辑: app/components/Sidebar.tsx

# 修改 Logo
编辑: app/components/MagicNavbar.tsx
```

### 3. 添加你的文章

在 `source/_posts/` 目录下添加 Markdown 文件：

```markdown
---
title: 你的文章标题
date: 2025-12-27 10:00:00
tags: ['标签1', '标签2']
categories: ['分类']
cover: /images/cover.jpg
author: 你的名字
---

# 文章内容
```

### 4. 本地开发

```bash
npm install
npm run dev
```

### 5. 部署

```bash
npm run build
```

输出目录: `out/`

可部署到：
- GitHub Pages
- Cloudflare Pages
- Vercel
- Netlify

## 自定义

### 修改主题颜色

编辑 `app/styles/theme.css`：

```css
:root {
  --accent-color: #22d3ee;  /* 主色调 */
  --text-primary: #f1f5f9;  /* 主文字色 */
  --text-secondary: #94a3b8; /* 次要文字色 */
}
```

### 添加自定义工具

1. 在 `app/tools/` 创建页面
2. 在 `MagicNavbar.tsx` 添加导航

## 许可证

MIT License

## 致谢

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Lucide Icons](https://lucide.dev/)

---

*由 iOSlike 主题强力驱动*
