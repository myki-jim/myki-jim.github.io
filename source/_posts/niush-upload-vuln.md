---
title: niushop文件上传漏洞实战
date: 2025-03-23
tags: ['CTF', '网络安全', '渗透', '抓包']
categories: ['CTF', '工具', '抓包', '渗透测试']
layout: post
cover: https://blogtc.jimmyki.com/images/CTF/n31.png
---

！！！注意：本文章仅用于学习交流，请勿用于非法用途！！！

# niushop文件上传漏洞实战

# 0x01 漏洞概述

NiuShop是一款基于ThinkPHP5.1开发的B2B2C多用户商城系统。在某些版本的NiuShop中，存在文件上传漏洞。由于对上传文件的类型和内容校验不足，攻击者可以利用该漏洞上传恶意文件（如webshell），从而获取网站服务器的控制权限。 成功利用此漏洞，攻击者可以执行任意代码，篡改网站数据，甚至控制整个服务器，造成严重的安全风险。

# 0x02 漏洞复现

## 1. 环境搭建

在开始漏洞复现之前，我们需要搭建一个存在漏洞的NiuShop环境。

- **下载NiuShop源码**：
  从官方网站或可信渠道下载存在漏洞的NiuShop版本源码，并解压到本地或云服务器上。 （建议选择历史版本，更容易复现漏洞）

- **搭建PHP环境**：
  确保你的服务器或本地环境已经安装并配置好了PHP环境。这通常包括：
  - 安装PHP解释器（建议选择与NiuShop兼容的版本，例如PHP 7.2 或 7.4）。
  - 安装Web服务器（如Apache或Nginx）。
  - 安装数据库服务器（如MySQL或MariaDB）。

- **配置数据库**：
  - 创建一个新的数据库，用于存储NiuShop的数据。
  - 修改NiuShop的配置文件（通常位于 `config/database.php`），填写数据库连接信息，包括数据库主机、数据库名称、用户名和密码。

- **部署NiuShop**：
  将解压后的NiuShop源码复制到Web服务器的根目录下。

- **运行安装向导**：
  在浏览器中访问NiuShop的安装页面（通常是你的域名或IP地址加上 `/install`），按照安装向导的提示完成NiuShop的安装。

> 巴拉巴拉……(PHP环境、PHP项目部署建议度娘)
> （这里可以更详细一些，给出一些常用的PHP环境搭建工具，例如 XAMPP, WAMP, LAMP 等，并简单介绍如何使用这些工具搭建环境。也可以提供一些在线教程的链接。）

## 2. 漏洞利用

现在我们已经成功搭建了一个存在漏洞的NiuShop网站，接下来我们将演示如何利用文件上传漏洞来获取网站权限。

### 找到上传点

在NiuShop网站中寻找上传点。常见的上传点通常位于用户中心、商品上传、图片上传等地方。我们需要仔细浏览网站的各个功能模块，寻找可能存在文件上传功能的页面。

我们发现，在用户中心存在头像上传功能，这可能是一个潜在的文件上传点。 尝试上传文件，看看是否存在文件类型限制或其他安全措施。

![上传漏洞所在地方](https://blogtc.jimmyki.com/images/CTF/n2.png)

### 构造上传包并上传文件

#### 抓包分析：

首先，上传一张正常的图片（例如 `image.png`），并使用抓包工具（如Burp Suite, Proxyman, Charles等）观察上传点的请求包。抓包工具可以帮助我们分析上传请求的各个参数，包括请求方法、URL、请求头、请求体等。

#### 分析请求：

重点关注以下信息：

- **请求URL**：上传文件的URL地址。
- **请求方法**：通常是POST请求。
- **Content-Type**：指示上传文件的类型。
- **文件名**：上传文件的原始名称。
- **文件内容**：上传文件的二进制数据。

![对上传的图片进行抓包](https://blogtc.jimmyki.com/images/CTF/n3p.png)

#### 绕过文件类型限制：

通过抓包分析，我们发现上传点存在文件类型限制。这意味着服务器会检查上传文件的扩展名或MIME类型，以防止上传恶意文件。

常见的绕过文件类型限制的方法包括：

- **修改Content-Type**：将 `Content-Type` 修改为 `image/png` 或其他允许的MIME类型。
- **修改文件名**：将文件名改为 `xxxxxx.php`，尝试直接上传PHP文件。
- **双扩展名绕过**：将文件名改为 `xxxxxx.php.png` 或 `xxxxxx.jpg.php`。
- **利用文件内容**：在PHP文件头部添加图片的文件头信息，伪装成图片文件。

我们尝试修改 `Content-Type` 为 `image/png`，并且文件名改为 `xxxxxx.php`，再次上传。

![修改包内容](https://blogtc.jimmyki.com/images/CTF/n31.png)

#### 上传恶意代码：

在PHP文件中，我们可以写入一些恶意代码，例如：

```
1 2 3 4 <?php echo "<pre>"; system($_GET['cmd']); ?>
```

这段代码允许我们通过 `cmd` 参数执行任意系统命令。

### 上传成功，获取网站权限

如果上传成功，服务器会返回上传文件的URL地址或存储路径。我们需要找到上传文件的存储路径，然后在浏览器中访问该路径。

![上传成功](https://blogtc.jimmyki.com/images/CTF/n5.png)

通过访问上传的PHP文件，并传递 `cmd` 参数，我们可以执行任意系统命令，从而获取网站服务器的控制权限。

例如，访问 `http://your-niushop-domain/upload/avatar/xxxxxx.php` ，可以连接到中国菜刀

![获取网站权限](https://blogtc.jimmyki.com/images/CTF/n6.png)

(PS):niushop简直千疮百痍啊

---

关于本文
由 Jimmy Ki 撰写, 采用 [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0) 许可协议.