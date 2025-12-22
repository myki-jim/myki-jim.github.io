# 写作工具使用指南

## 🎯 概述

这是一个功能强大的 Hexo 博客写作工具，提供 Web 界面和命令行两种使用方式，集成了 Git 操作、调试工具、一键部署等功能。

## 🚀 快速开始

### 1. 一键启动

#### Linux/macOS
```bash
./start.sh
```

#### Windows
```batch
start.bat
```

### 2. 手动启动

#### 安装依赖
```bash
# 安装 Node.js 依赖
npm install

# 安装 Python 依赖
pip3 install -r blog_tools/requirements.txt
```

#### 启动 Web 界面
```bash
python3 blog_writer.py web
```

然后访问 http://localhost:5000

## 🌐 Web 界面功能

### 主要功能

1. **文章管理**
   - 📝 创建新文章
   - ✏️ 编辑现有文章
   - 🔍 搜索文章
   - 📋 文章列表

2. **Markdown 编辑器**
   - 实时预览
   - 语法高亮
   - 快捷工具栏
   - 文章模板

3. **Git 集成**
   - 📊 Git 状态检查
   - 📝 一键提交
   - 🚀 一键推送
   - 📥 拉取更新

4. **调试工具**
   - 🔗 链接检查
   - ✅ 格式验证
   - 📊 统计信息
   - 🛠️ Hexo 命令执行

### 快捷键

- `Ctrl/Cmd + S`: 保存文章
- `Ctrl/Cmd + P`: 预览文章
- `Ctrl/Cmd + G`: Git 状态
- `Ctrl/Cmd + Enter`: 快速提交

## 💻 命令行工具

### 基础命令

```bash
# 创建新文章
python3 blog_writer.py new "文章标题" --tags 标签1 标签2 --categories 分类

# 列出文章
python3 blog_writer.py list --limit 10

# 搜索文章
python3 blog_writer.py search "关键词"

# 启动服务器
python3 blog_writer.py serve --port 4000

# 生成静态文件
python3 blog_writer.py generate

# 部署网站
python3 blog_writer.py deploy
```

### Git 操作

```bash
# 查看Git状态
python3 blog_writer.py git status

# 提交更改
python3 blog_writer.py git commit

# 推送到远程
python3 blog_writer.py git push

# 拉取更改
python3 blog_writer.py git pull
```

### 调试工具

```bash
# 检查链接
python3 blog_writer.py debug links

# 验证文章格式
python3 blog_writer.py debug validate

# 显示统计信息
python3 blog_writer.py debug stats
```

### 其他功能

```bash
# 备份博客
python3 blog_writer.py backup

# 启动Web界面
python3 blog_writer.py web
```

## 🔧 高级功能

### 1. 批量操作

```bash
# 批量检查所有文章
python3 blog_writer.py debug validate

# 批量检查链接
python3 blog_writer.py debug links

# 显示详细统计
python3 blog_writer.py debug stats
```

### 2. 自定义模板

创建新文章时可以使用内置模板：
- 技术文章模板
- 学习笔记模板
- 项目总结模板

### 3. 自动备份

支持自动备份功能，包含：
- 所有文章文件
- 配置文件
- 主题文件
- 备份信息

## 🛠️ 故障排除

### 常见问题

1. **端口被占用**
   ```bash
   # 使用不同端口启动
   python3 blog_writer.py serve --port 4001
   ```

2. **依赖缺失**
   ```bash
   # 重新安装依赖
   npm install
   pip3 install -r blog_tools/requirements.txt
   ```

3. **Git 操作失败**
   ```bash
   # 检查Git配置
   git config --list

   # 配置用户信息
   git config user.name "你的名字"
   git config user.email "你的邮箱"
   ```

4. **Hexo 命令失败**
   ```bash
   # 重新安装Hexo CLI
   npm install -g hexo-cli

   # 清理缓存
   npx hexo clean
   ```

### 调试模式

```bash
# 启用调试模式
python3 blog_writer.py --debug [command]
```

## 📋 配置文件

### Hexo 配置
- `_config.yml`: Hexo 主配置
- `_config.next.yml`: Next 主题配置

### 工具配置
工具使用环境变量和默认配置，无需额外配置文件。

## 🔌 扩展功能

### 1. 自定义脚本

可以在 `blog_tools/` 目录下添加自定义脚本。

### 2. 主题定制

支持 Next 主题的完整定制，参考：
- [Next 主题文档](https://theme-next.js.org/)

### 3. 插件集成

支持 Hexo 插件生态，可以安装各种扩展插件。

## 📞 支持与反馈

如果遇到问题，请：

1. 检查本文档的故障排除部分
2. 查看 Hexo 官方文档
3. 检查 GitHub Issues

## 📝 更新日志

### v2.0.0 (当前版本)
- ✅ 新增 Web 界面
- ✅ Git 集成功能
- ✅ 调试工具集
- ✅ 一键部署
- ✅ 批量操作
- ✅ 自动备份

### v1.0.0
- ✅ 基础命令行功能
- ✅ 文章管理
- ✅ 搜索功能

## 🎉 享受写作

这个工具旨在简化博客写作流程，让你专注于内容创作。希望它能提高你的写作效率！