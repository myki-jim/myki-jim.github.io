# MyKi's Blog

个人技术博客，基于 Hexo 静态博客框架构建。

## 🚀 特色功能

- ⚡ **Hexo 框架**: 快速、简单的静态博客生成器
- 🎨 **Next 主题**: 简洁美观的主题设计
- 📱 **响应式**: 支持多设备访问
- 🔄 **自动化部署**: GitHub Actions 自动部署到 GitHub Pages
- 🛠️ **写作工具**: 自定义 Python 工具，简化写作流程

## 📁 项目结构

```
myki-jim.github.io/
├── source/                 # 源文件目录
│   ├── _posts/            # 博客文章
│   └── about/             # 关于页面
├── themes/                # 主题文件
├── _config.yml           # Hexo 配置
├── _config.next.yml      # Next 主题配置
├── blog_writer.py        # 写作工具
├── .github/workflows/    # GitHub Actions 配置
└── package.json          # 项目依赖
```

## 🛠️ 本地开发

### 环境要求

- Node.js >= 14
- Python >= 3.6 (用于写作工具)

### 安装依赖

```bash
npm install
```

### 使用写作工具

#### 方式一：一键启动（推荐）

```bash
# Linux/macOS
./start.sh

# Windows
start.bat
```

#### 方式二：Web 界面

```bash
# 启动 Web 界面
python3 blog_writer.py web

# 然后访问 http://localhost:5000
```

#### 方式三：命令行工具

```bash
# 创建新文章
python3 blog_writer.py new "文章标题" --tags 标签1 标签2 --categories 分类

# 列出文章
python3 blog_writer.py list

# 搜索文章
python3 blog_writer.py search "关键词"

# 启动本地服务器
python3 blog_writer.py serve --port 4000

# 生成静态文件
python3 blog_writer.py generate

# Git 操作
python3 blog_writer.py git status
python3 blog_writer.py git commit
python3 blog_writer.py git push

# 调试工具
python3 blog_writer.py debug links
python3 blog_writer.py debug validate
python3 blog_writer.py debug stats

# 备份博客
python3 blog_writer.py backup
```

### 直接使用 Hexo 命令

```bash
# 启动本地服务器
npx hexo server

# 创建新文章
npx hexo new "文章标题"

# 生成静态文件
npx hexo generate

# 部署到远程
npx hexo deploy
```

## 📝 写作指南

### 文章格式

```markdown
---
title: 文章标题
date: 2025-12-22 12:00:00
tags: [标签1, 标签2]
categories: [分类]
---

# 文章内容

在这里写你的内容...

<!-- more -->

更多内容...
```

### 注意事项

- 使用 `<!-- more -->` 标签设置文章摘要
- 文章会自动按日期排序
- 支持标准的 Markdown 语法

## 🚀 自动部署

项目配置了 GitHub Actions，当推送到 `main` 分支时会自动：

1. 安装依赖
2. 生成静态文件
3. 部署到 GitHub Pages

部署完成后即可访问 https://myki-jim.github.io

## 🎨 主题配置

主题配置在 `_config.next.yml` 文件中，支持：

- 选择不同的 Scheme 样式
- 自定义菜单和社交链接
- 配置颜色和字体
- 开启/关闭各种功能模块

详细配置参考 [Next 主题文档](https://theme-next.js.org/)

## 📄 许可证

MIT License
