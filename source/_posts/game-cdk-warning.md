---
title: 别被骗了！某多多买游戏CDK根本不靠谱！
date: 2024-11-29
tags: ['CTF', '网络安全', '游戏', 'CDK']
categories: ['网络安全', '游戏安全']
layout: post
banner: https://blogtc.jimmyki.com/images/cdk/7.webp
---

事情是这样的，我去某多多逛，发现地平线5国区才0.25！这能忍，立马准备下单，可是发现不对，哪来那么多便宜捡，世界上哪来那么多做慈善的人。于是乎，我问了客服，截图如下：

![Image 1](https://blogtc.jimmyki.com/images/cdk/1.jpeg)

我很聪明的选择了不下单（绝对不是因为没钱），根据客服的指引，我打开了他的教程，里面有一行指令。在他的命令中，irm是下载功能，iex是运行，代表着下载并运行，但经验丰富的江师傅怎可能运行，顺着URL，我找到了下载链接，下载了一个名为Steam的Powershell可执行文件，打开发现是一行如下的解码运行base64的代码：

![Image 2](https://blogtc.jimmyki.com/images/cdk/2.png)

于是乎，我又去Base64解码工具将文本内容转码为UTF-8，得到了如下代码：

![Image 3](https://blogtc.jimmyki.com/images/cdk/3.jpeg)

您猜怎么着，这段代码是使用C#语言编写的，它执行了以下操作：

1. 定义了两个Base64编码的字符串变量 $vzwnbqd 和 $bmoyqc。
2. 创建了一个 AES 加密算法对象 $hjfmpy，并设置了一些相关属性，如加密模式为ECB、填充模式为PKCS7、块大小为128位、密钥长度为128位。
3. 将 Base64 编码的密文 $vzwnbqd 解密，并将解密后的结果存储在变量 $nczb 中。
4. 对解密后的数据进行压缩，使用DeflateStream实现。
5. 将压缩后的数据转换为UTF-8编码的字符串，并使用 Invoke-Expression 执行该字符串作为脚本。

总的来说，这段代码的作用是解密一个Base64编码的AES加密数据，并对解密后的数据进行压缩和执行。

我当然不会让它运行，所以我选择把Invoke-Expression换成输出语句，看看最后的代码是什么，我运行了修改后的power shell，结果出现了第二次解密：

![Image 4](https://blogtc.jimmyki.com/images/cdk/4.webp)

同样的步骤获得了第三次解密：

![Image 5](https://blogtc.jimmyki.com/images/cdk/5.webp)

最终将这段代码执行，在控制台我们得到了最后的代码：

![Image 6](https://blogtc.jimmyki.com/images/cdk/6.webp)

（插句嘴，脚本的编写者用心了，Steam画的这么标准）

这段代码是PowerShell脚本，用于下载和安装虚假的Steam客户端。首先定义一个名为Get-RandomString的函数，用于生成随机字符串。然后定义一个名为PwStart的函数，用于下载和安装虚假的Steam客户端。在PwStart函数中，首先检查360安全卫士和360浏览器是否正在运行，如果正在运行，则显示红字提示并暂停一段时间，然后继续检查。接下来，尝试停止真正的steam进程，如果成功停止，则继续执行安装虚假的Steam客户端的操作。安装完成后，显示绿字提示。如果在执行过程中发生错误，将显示相应的错误信息。最后，调用PwStart函数开始执行。

![Image 7](https://blogtc.jimmyki.com/images/cdk/7.webp)

而虚假的Steam又有什么害处呢，

总的来说，这种办法确实能骗到小白，所以说千万不要贪图便宜，轻则账号红信，重则Steam号直接没了，买游戏还是得到正版平台。

![Image 8](https://blogtc.jimmyki.com/images/cdk/8.png)

---

关于本文

由 Jimmy Ki 撰写, 采用 CC BY-NC 4.0 许可协议.
