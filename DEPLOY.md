# iOSlike 主题部署指南

一个仿 iOS 风格的 Next.js 博客主题，采用玻璃拟态设计。

## 特性

- **玻璃拟态设计** - 半透明毛玻璃效果
- **搜索功能** - 全局搜索 (Ctrl/Cmd+F)
- **图片优化** - 懒加载、点击放大、骨架屏
- **开发工具箱** - 12+ 实用工具
- **无限滚动** - 流畅的加载体验
- **主题支持** - 深色/浅色模式

## 快速开始

### 方式一：GitHub Pages

1. Fork [myki-jim/myki-jim.github.io](https://github.com/myki-jim/myki-jim.github.io)
2. 改名为 `你的用户名.github.io`
3. 修改个人信息（见下方）
4. 推送后访问 `https://你的用户名.github.io`

### 方式二：Cloudflare Pages

1. Fork 并重命名仓库
2. Cloudflare Dashboard → Workers & Pages → 创建 Pages
3. 构建设置：
   - 构建命令: `npm run build`
   - 输出目录: `out`
   - Node.js: `18`
4. 部署

---

## 修改个人信息

### 1. 侧边栏信息

**文件**: `app/components/Sidebar.tsx`

```typescript
// 头像
<img src="/images/avatar.png" />  // 改为你的头像路径

// 名称
<h3>Jimmy Ki</h3>  // 改为你的名字

// 头衔
<p>安全研究员 & 开发者</p>  // 改为你的头衔

// 描述
<p>专注于网络安全、漏洞分析与全栈开发</p>  // 改为你的简介
```

### 2. Logo 头像

**文件**: `app/components/MagicNavbar.tsx`

```typescript
<img src="/images/avatar.png" />  // 改为你的头像
```

### 3. Hello World 封面

**文件**: `source/_posts/hello-world.md`

```yaml
cover: /images/avatar.png  # 改为你的封面
```

### 4. Hero 标题（可选）

**文件**: `app/components/HeroTitle.tsx`

```typescript
const BLOG_TITLE = "Jimmy Ki's Blog";      // 改为你的博客名
const BLOG_SUBTITLE = "技术笔记、编程...";  // 改为你的副标题
```

---

## 主题切换

主题会根据系统自动切换，也支持手动切换。

### 修改主题色

**文件**: `app/styles/theme.css`

```css
:root {
  /* 主色调 */
  --accent-color: #22d3ee;
  --accent-glow: rgba(34, 211, 238, 0.3);

  /* 文字颜色 */
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --text-tertiary: #64748b;
}
```

---

## 内置工具

### 工具列表

| 工具 | 功能 |
|------|------|
| 正则测试器 | 实时测试正则表达式 |
| 哈希生成器 | MD5、SHA-1/256 等 |
| 编解码转换器 | Base64/URL/HTML/十六进制 |
| JSON 格式化器 | 格式化、验证 JSON |
| UUID 生成器 | 批量生成 UUID v4 |
| RSA 密钥生成器 | 生成 RSA 密钥对 |
| 密码生成器 | 安全随机密码 |
| Markdown 编辑器 | 实时预览 |
| 二维码生成器 | 多种格式 |
| Mermaid 图表 | 流程图、时序图 |
| UML 设计器 | UML 建模 |
| 2048 游戏 | 经典游戏 |

### 添加新工具

1. 在 `app/tools/` 创建页面，如 `app/tools/mytool/page.tsx`
2. 在 `MagicNavbar.tsx` 的 tools 数组中添加：

```typescript
{ label: '新工具', slug: 'mytool', desc: '工具描述' },
```

---

## 添加文章

在 `source/_posts/` 添加 Markdown 文件：

```markdown
---
title: 文章标题
date: 2025-12-27 10:00:00
tags: ['标签1', '标签2']
categories: ['分类']
cover: /images/封面.jpg
author: 你的名字
---

# 内容

使用 Markdown 编写...
```

---

## 删除示例文章

```bash
rm source/_posts/ctf-tools.md
rm source/_posts/cve-*.md
rm source/_posts/game-cdk-warning.md
rm source/_posts/ipv6-tutorial.md
rm source/_posts/migration-plan.md
rm source/_posts/niush-upload-vuln.md
rm source/_posts/rustdesk-tutorial.md
rm source/_posts/ioslike-theme-intro.md  # 如果不需要主题介绍
```

---

## 命令

```bash
# 安装依赖
npm install

# 本地开发
npm run dev

# 构建生产版本
npm run build

# 清理缓存
npm run clean
```

---

## 部署配置

### GitHub Pages

项目设置 → Pages → Source: Deploy from main branch → 保存

### Vercel

1. 导入 GitHub 仓库
2. 构建命令: `npm run build`
3. 输出目录: `out`

### Netlify

1. 导入仓库
2. 构建命令: `npm run build`
3. 发布目录: `out`

---

## 常见问题

**Q: 头像不显示?**
A: 将头像放在 `public/images/`，确保路径正确

**Q: 如何修改底部版权?**
A: 编辑 `app/components/Footer.tsx`

**Q: 工具页面 404?**
A: 确保 `app/tools/工具名/page.tsx` 文件存在

---

## 许可证

MIT License

## 源码

[iOSlike Theme - GitHub](https://github.com/myki-jim/myki-jim.github.io)
