# 快速开始指南

## 🚀 立即使用你的新博客

### 1. 本地预览博客

```bash
# 启动本地服务器
npx hexo server

# 或者使用 Python 工具
python3 blog_writer.py serve
```

访问 http://localhost:4000 查看你的博客！

### 2. 创建第一篇文章

```bash
# 使用 Python 工具创建文章
python3 blog_writer.py new "我的第一篇技术文章" --tags 技术 Python --categories 编程

# 或使用 Hexo 命令
npx hexo new "我的第一篇技术文章"
```

### 3. 编辑文章

文章会保存在 `source/_posts/` 目录下，使用你喜欢的编辑器编辑 Markdown 文件。

### 4. 发布到 GitHub Pages

```bash
# 提交代码
git add .
git commit -m "添加我的第一篇文章"
git push

# 等待 GitHub Actions 自动部署完成
# 几分钟后访问 https://myki-jim.github.io
```

## 🛠️ Python 写作工具使用示例

```bash
# 查看帮助
python3 blog_writer.py --help

# 创建文章
python3 blog_writer.py new "学习 JavaScript" --tags JavaScript 前端 --categories 学习

# 列出最近的文章
python3 blog_writer.py list --limit 5

# 搜索文章
python3 blog_writer.py search "JavaScript"

# 按分类过滤
python3 blog_writer.py list --category 学习

# 按标签过滤
python3 blog_writer.py list --tag JavaScript
```

## 📝 文章写作建议

1. **文章命名**: 使用清晰的标题，避免特殊字符
2. **标签使用**: 使用有意义的标签，便于后续查找
3. **文章摘要**: 在适当位置使用 `<!-- more -->` 设置摘要
4. **图片管理**: 将图片放在 `source/images/` 目录下
5. **定期更新**: 保持博客的活跃度

## 🔧 常见问题

### Q: 如何更换主题？
A: 修改 `_config.yml` 中的 `theme` 字段，并在 `themes/` 目录下放置主题文件。

### Q: 如何自定义域名？
A: 在 GitHub 仓库设置中配置 Custom Domain，并在 `source/` 目录下创建 `CNAME` 文件。

### Q: 如何添加评论功能？
A: 在 `_config.next.yml` 中配置你喜欢的评论系统（如 Gitalk、Disqus 等）。

### Q: 如何备份博客？
A: 仓库中包含了所有源文件，直接备份整个 Git 仓库即可。

---

🎉 **恭喜！你的博客已经设置完成，开始写作吧！**