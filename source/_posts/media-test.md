---
title: 媒体查看器测试
date: 2025-12-27 18:00:00
tags: ['测试', '视频', '图片']
categories: ['测试']
cover: /images/screenshots/screenshot-tools.png
author: Jimmy Ki
---

# 图片查看器测试

点击下方的图片可以打开查看器，支持缩放、旋转和下载。

![主题截图](/images/screenshots/screenshot-home.png)

更多截图：

![工具箱截图](/images/screenshots/screenshot-tools.png)

![搜索功能截图](/images/screenshots/screenshot-search.png)

---

# 视频播放测试

## 本地视频测试

使用 `<video>` 标签嵌入本地视频：

<video src="/videos/test.mp4" />

## 远程 HDR 视频测试

测试远程 HDR 视频播放（支持 10000 nits）：

<video src="/videos/hdr-test.mp4" />

## 视频功能

- **HDR10 支持**：自动检测并应用 HDR 元数据
- **10000 nits**：支持高亮度范围显示
- **画中画**：可以在后台继续播放
- **全屏播放**：沉浸式观看体验
- **快捷键**：
  - `空格`：播放/暂停
  - `m`：静音
  - `f`：全屏
  - `Esc`：退出

---

# 图片功能

- **缩放**：使用 `+`/`-` 键或点击按钮
- **旋转**：按 `r` 键旋转 90 度
- **下载**：点击下载按钮保存图片
- **拖拽**：支持拖拽移动图片位置
