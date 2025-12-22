---
title: RustDesk远程桌面配置教程
date: 2024-04-29
tags: [工具, 教程, 远程桌面, RustDesk]
categories: [教程]
cover: https://linux.do/uploads/default/original/3X/e/d/ed3834e59e0be33970fa3c055a5324073742229b.png
layout: post
---

开源项目Rust Desk的自建服务器功能使用户远程控制的质量大大提升，今天我将告诉大家如何利用宝塔面板/1panel搭建

![](https://linux.do/uploads/default/original/3X/e/d/ed3834e59e0be33970fa3c055a5324073742229b.png)

**1.首先去官方网站下载服务端：[自建服务器 (rustdesk.com)](https://rustdesk.com/zh/server/)（根据服务器类型选择对应的架构）以我的为例，下载了如下版本**

![](https://linux.do/uploads/default/original/3X/b/8/b85fa548ef473443b720947f7322f44e533ad436.png)

**2.解压（3个文件），全部上传至服务器（记住指定文件夹记住路径，待会要用）**

![](https://linux.do/uploads/default/original/3X/5/8/58c9593a7b58572d83725e8f620bd117bf07c1bd.png)

![](https://linux.do/uploads/default/original/3X/5/c/5c51504a336936ca6aa1fdf46e4f67fac87074a9.png)

**3.到宝塔软件管理安装进程守护管理器（对应1panle的进程守护工具）**

![](https://linux.do/uploads/default/original/3X/9/2/92c38b1056d7bc9e9440accc529c2c5e956988f9.png)

**4.打开进程守护管理器，并添加如图两个（这里以宝塔面板为例）**

![](https://linux.do/uploads/default/original/3X/1/3/1320f3202de771bbaae18a4ee9cef6093a6f1ddf.png)

![](https://linux.do/uploads/default/original/3X/9/4/94401bd92d4cafbc415707c4a1f98382e3c26ffc.png)

保存，重启服务器，接下来会在服务端的文件夹多出一堆文件，点击红箭头所指的文件

![](https://linux.do/uploads/default/original/3X/e/d/ed020ef2f5e30de29c21d332a85edeaea50af132.png)

里面的内容即为公钥key

**<mark>接下来为客户端配置</mark>**

如图所示输入服务器信息即可（主控端被控端需配置同一台服务器）

![](https://linux.do/uploads/default/original/3X/0/2/02a0ffda38a1e059ca46ac72e3936ba454aa9fed.png)

![](https://linux.do/uploads/default/original/3X/3/4/348f59f708f4c05f4800e966aa1d827c62608afa.png)

该教程不仅适用于运维面板，也可以添加到系统服务