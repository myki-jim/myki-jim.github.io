---
title: 公网IPv6配置教程他来了！可用作远程桌面连接、服务器（非Web网页）、游戏服务（我的世界）
date: 2024-11-25
tags: ['IPv6', '网络配置', '远程桌面', '服务器', '游戏', '网络']
categories: ['技术教程']
layout: post
author: JimmyKi
banner: /images/ipv6/1.webp
---

# 公网IPv6配置教程他来了！可用作远程桌面连接、服务器（非Web网页）、游戏服务（我的世界）

## 一、检测

首先先检测是否为公网ipv6（或者是否被光猫墙了）

![IPv6测试](https://blogtc.jimmyki.com/images/ipv6/1.webp)

如果测试页面打不开，或者页面和我的不一样，请移步192.168.1.1 27，登录超级管理员（自行百度，每个地区不一样）查看是否连接至ipv6，若显示ipv6地址如图，则说明有公网ip，

![IPv6地址](https://blogtc.jimmyki.com/images/ipv6/2.webp)

如果显示ipv4地址，则说明被光猫墙了，此时需要联系光猫客服，申请公网ipv6，或者更换光猫，或者使用ipv6桥接模式（不推荐，因为ipv6桥接模式会禁用大部分功能，比如wifi，不过大家大可不使用wifi，直接用网线连接电脑和光猫即可）

此时需要设置允许广域网访问，并降低防火墙安全性（一般不会有人闲的去攻击普通用户，大可放心）

![防火墙设置1](https://blogtc.jimmyki.com/images/ipv6/3.webp)

防火墙设置：

![防火墙设置2](https://blogtc.jimmyki.com/images/ipv6/4.webp)

## 二、将ipv6分配到设备

很多朋友吐槽"路由器继承不了ipv6啊，怎么办啊"，别急，下面是三种方法：

1. Plan 最稳妥的方法直接用网线连接电脑和光猫，但是很多光猫只有一个千兆口，插千兆口可能有点浪费，插百兆口跑不满，以下是我给出的两种解决方案：

2. Plan A、改路由器为桥接模式（将禁用大多数功能，不过大家大可不必担心，禁用的功能一般用不到）

以我的路由器为例，登录路由器管理页面，打开网络设置，如下配置：

![路由器配置](https://blogtc.jimmyki.com/images/ipv6/5.webp)

设置为中继模式（ap模式、桥接模式）

3. Plan B、改光猫为桥接模式（危险程度极高，谨慎操作，需要知道宽带账号密码，不是光猫下面贴的）

登录超级管理员用户，打开光猫的网络设置，如下配置：（建议截图保留原来配置以恢复）

![光猫配置](https://blogtc.jimmyki.com/images/ipv6/6.webp)

设置完成后，打开路由器管理页面，设置ipv6获取方式从自动获取更变为为拨号连接，输入宽带账号密码即可

### 三、获取ipv6地址：

理论上ipv6可以为世界上的每一粒沙子分配一个地址，我们的地址获取方法也很简单，如果你是Windows用户，按win+r输入cmd，在命令提示框中输入ipconfig

![Windows IP配置](https://blogtc.jimmyki.com/images/ipv6/7.webp)

箭头所指的ipv6地址都可以被外界访问，如果你是Linux用户，就不必我讲了，你肯定会

什么，太复杂，下面是解决方案（选看）

PS:域名购买和ddns服务

选购国内外云服务（腾讯云，阿里云）的域名，添加AAAA解析，这里以腾讯云为例

![AAAA解析](https://blogtc.jimmyki.com/images/ipv6/8.webp)

AAAA解析记录是ipv6专用的解析类型，鉴于家用网络ipv6经常变动的情况，我推荐大家使用ddns-go（非恰饭）动态解析域名，win端下载地址

[https://geeklab.work/ddns.zip](https://geeklab.work/ddns.zip)

下载完成后打开，在浏览器中输入localhost:9876

![DDNS管理界面](https://blogtc.jimmyki.com/images/ipv6/9.webp)

在对应区域输入在域名商获取的token，把ipv4是否启用的框框取消勾选，ipv6勾上

![DDNS配置](https://blogtc.jimmyki.com/images/ipv6/10.webp)

点击save保存即可

### 讲讲他的实际作用

#### 我的世界服务器：

首先准备服务端（不提供技术支持）双击运行脚本打开

![Minecraft服务端准备](https://blogtc.jimmyki.com/images/ipv6/11.webp)

等等，还没完

成功运行

![Minecraft服务端运行](https://blogtc.jimmyki.com/images/ipv6/12.webp)

打开游戏选择加入多人游戏输入你的[域名：端口号]即可

#### 远程桌面连接：

首先准备服务端（不提供技术支持）双击运行脚本打开

![远程桌面准备](https://blogtc.jimmyki.com/images/ipv6/13.webp)

打开系统自带的桌面连接工具，输入对应主机的域名即可

![远程桌面连接](https://blogtc.jimmyki.com/images/ipv6/14.webp)

到此结束

等等，还没完

附上python自动化获取ipv6地址的教程（ipv6地址经常发生变动，造一个小轮子给大家方便使用）

```python
import socket
import re

def get_ipv6_addresses():
    ipv6_addresses = []
    try:
        hostname = socket.gethostname()
        addrinfo = socket.getaddrinfo(hostname, None, socket.AF_INET6)
        for address in addrinfo:
            ipv6_address = address[4][0]
            ipv6_addresses.append(ipv6_address)
    except socket.gaierror:
        print("无法获取IPv6地址")
        return ipv6_addresses
    return ipv6_addresses

def find_ipv6_starting_with_24(ipv6_addresses):
    pattern = r'^24[0-9a-fA-F:]+'
    matching_addresses = []
    for address in ipv6_addresses:
        if re.match(pattern, address):
            matching_addresses.append(address)
    return matching_addresses

if __name__ == "__main__":
    ipv6_addresses = get_ipv6_addresses()
    if ipv6_addresses:
        matching_addresses = find_ipv6_starting_with_24(ipv6_addresses)
        if matching_addresses:
            print(matching_addresses[0])
            pass #这儿添加ddns执行脚本，matching_addresses[0]或matching_addresses[1]都可以作为本机的公网ipv6地址
        else:
            print("\n未找到公网IPv6地址")
```

---

> **关于本文**
>
> 由 Jimmy Ki 撰写, 采用 [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0) 许可协议.
>
> 标签：[#IPv6](/tagss/ipv6/) [#远程桌面](/tagss/远程桌面/) [#服务器](/tagss/服务器/) [#游戏](/tagss/游戏/) [#网络](/tagss/网络/)