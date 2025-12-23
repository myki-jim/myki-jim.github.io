'use client';

import React, { useState, useEffect } from 'react';
import {
  QrCode,
  Copy,
  Download,
  RefreshCw,
  Check,
  Image,
  Link,
  Type,
  Mail,
  Phone,
  Wifi,
  FileText,
  Smile,
  Palette,
  Scan
} from 'lucide-react';
import QRCode from 'qrcode';

type QRType = 'text' | 'url' | 'email' | 'phone' | 'wifi' | 'vcard';

interface QRConfig {
  type: QRType;
  text: string;
  url: string;
  email: string;
  subject: string;
  phone: string;
  ssid: string;
  password: string;
  security: 'WPA' | 'WEP' | 'nopass';
  name: string;
  phoneContact: string;
  emailContact: string;
  org: string;
  size: number;
  color: string;
  backgroundColor: string;
}

const QRCodeGenerator: React.FC = () => {
  const [qrCode, setQrCode] = useState<string>('');
  const [config, setConfig] = useState<QRConfig>({
    type: 'text',
    text: '',
    url: 'https://',
    email: '',
    subject: '',
    phone: '',
    ssid: '',
    password: '',
    security: 'WPA',
    name: '',
    phoneContact: '',
    emailContact: '',
    org: '',
    size: 300,
    color: '#000000',
    backgroundColor: '#FFFFFF'
  });
  const [copied, setCopied] = useState(false);

  const qrTypes = [
    { id: 'text' as QRType, name: '纯文本', icon: Type, description: '任意文本内容' },
    { id: 'url' as QRType, name: '网址链接', icon: Link, description: 'http:// 或 https://' },
    { id: 'email' as QRType, name: '电子邮件', icon: Mail, description: 'mailto: 链接' },
    { id: 'phone' as QRType, name: '电话号码', icon: Phone, description: 'tel: 链接' },
    { id: 'wifi' as QRType, name: 'WiFi 网络', icon: Wifi, description: 'WiFi 连接信息' },
    { id: 'vcard' as QRType, name: '电子名片', icon: FileText, description: 'VCard 格式' }
  ];

  // 生成二维码数据
  const generateQRData = (): string => {
    switch (config.type) {
      case 'text':
        return config.text || '请输入文本';

      case 'url':
        return config.url || 'https://example.com';

      case 'email':
        const mailto = config.email ? `mailto:${config.email}` : '';
        const params = [];
        if (config.subject) params.push(`subject=${encodeURIComponent(config.subject)}`);
        return mailto + (params.length ? `?${params.join('&')}` : '');

      case 'phone':
        return config.phone ? `tel:${config.phone}` : 'tel:';

      case 'wifi':
        return `WIFI:T:${config.security};S:${config.ssid};P:${config.password};;`;

      case 'vcard':
        return `BEGIN:VCARD
VERSION:3.0
FN:${config.name}
TEL:${config.phoneContact}
EMAIL:${config.emailContact}
ORG:${config.org}
END:VCARD`;

      default:
        return '';
    }
  };

  // 生成二维码
  const generateQR = async () => {
    const data = generateQRData();
    if (!data) return;

    try {
      const url = await QRCode.toDataURL(data, {
        width: config.size,
        margin: 2,
        color: {
          dark: config.color,
          light: config.backgroundColor
        }
      });
      setQrCode(url);
    } catch (error) {
      console.error('生成二维码失败:', error);
    }
  };

  // 自动生成
  useEffect(() => {
    generateQR();
  }, [config]);

  // 下载二维码
  const downloadQR = () => {
    if (!qrCode) return;
    const a = document.createElement('a');
    a.href = qrCode;
    a.download = `qrcode-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // 复制到剪贴板
  const copyToClipboard = () => {
    const data = generateQRData();
    navigator.clipboard.writeText(data);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateConfig = (key: keyof QRConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-3">二维码生成器</h2>
        <p className="text-[var(--text-secondary)]">支持文本、链接、WiFi、名片等多种格式的二维码生成</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* 左侧：配置区域 */}
        <div className="space-y-6">
          {/* 二维码类型选择 */}
          <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-3xl p-6 backdrop-blur-2xl">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2 mb-4">
              <Scan size={18} className="text-[var(--accent-color)]" />
              二维码类型
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {qrTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => updateConfig('type', type.id)}
                    className={`p-4 rounded-xl transition-all ${
                      config.type === type.id
                        ? 'bg-[var(--accent-color)] text-black font-bold'
                        : 'bg-[var(--glass-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <Icon size={24} className="mx-auto mb-2" />
                    <div className="text-xs font-bold">{type.name}</div>
                    <div className="text-xs opacity-80 mt-1">{type.description}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 内容输入 */}
          <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-3xl p-6 backdrop-blur-2xl">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2 mb-4">
              <Type size={18} className="text-[var(--accent-color)]" />
              输入内容
            </h3>

            {config.type === 'text' && (
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  文本内容
                </label>
                <textarea
                  value={config.text}
                  onChange={(e) => updateConfig('text', e.target.value)}
                  placeholder="输入要生成二维码的文本内容..."
                  className="w-full h-32 bg-[var(--glass-surface-hover)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-color)] transition-colors resize-none"
                />
              </div>
            )}

            {config.type === 'url' && (
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  网址链接
                </label>
                <input
                  type="url"
                  value={config.url}
                  onChange={(e) => updateConfig('url', e.target.value)}
                  placeholder="https://example.com"
                  className="w-full bg-[var(--glass-surface-hover)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-color)] transition-colors"
                />
              </div>
            )}

            {config.type === 'email' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    邮箱地址
                  </label>
                  <input
                    type="email"
                    value={config.email}
                    onChange={(e) => updateConfig('email', e.target.value)}
                    placeholder="example@email.com"
                    className="w-full bg-[var(--glass-surface-hover)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-color)] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    邮件主题（可选）
                  </label>
                  <input
                    type="text"
                    value={config.subject}
                    onChange={(e) => updateConfig('subject', e.target.value)}
                    placeholder="邮件主题"
                    className="w-full bg-[var(--glass-surface-hover)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-color)] transition-colors"
                  />
                </div>
              </div>
            )}

            {config.type === 'phone' && (
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  电话号码
                </label>
                <input
                  type="tel"
                  value={config.phone}
                  onChange={(e) => updateConfig('phone', e.target.value)}
                  placeholder="+86 138 0000 0000"
                  className="w-full bg-[var(--glass-surface-hover)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-color)] transition-colors"
                />
              </div>
            )}

            {config.type === 'wifi' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    网络名称 (SSID)
                  </label>
                  <input
                    type="text"
                    value={config.ssid}
                    onChange={(e) => updateConfig('ssid', e.target.value)}
                    placeholder="WiFi名称"
                    className="w-full bg-[var(--glass-surface-hover)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-color)] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    密码
                  </label>
                  <input
                    type="text"
                    value={config.password}
                    onChange={(e) => updateConfig('password', e.target.value)}
                    placeholder="WiFi密码"
                    className="w-full bg-[var(--glass-surface-hover)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-color)] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    加密方式
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['WPA', 'WEP', 'nopass'] as const).map((sec) => (
                      <button
                        key={sec}
                        onClick={() => updateConfig('security', sec)}
                        className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                          config.security === sec
                            ? 'bg-[var(--accent-color)] text-black'
                            : 'bg-[var(--glass-surface-hover)] text-[var(--text-secondary)]'
                        }`}
                      >
                        {sec === 'nopass' ? '无密码' : sec}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {config.type === 'vcard' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    姓名
                  </label>
                  <input
                    type="text"
                    value={config.name}
                    onChange={(e) => updateConfig('name', e.target.value)}
                    placeholder="张三"
                    className="w-full bg-[var(--glass-surface-hover)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-color)] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    电话
                  </label>
                  <input
                    type="tel"
                    value={config.phoneContact}
                    onChange={(e) => updateConfig('phoneContact', e.target.value)}
                    placeholder="+86 138 0000 0000"
                    className="w-full bg-[var(--glass-surface-hover)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-color)] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    邮箱
                  </label>
                  <input
                    type="email"
                    value={config.emailContact}
                    onChange={(e) => updateConfig('emailContact', e.target.value)}
                    placeholder="example@email.com"
                    className="w-full bg-[var(--glass-surface-hover)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-color)] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    公司/组织
                  </label>
                  <input
                    type="text"
                    value={config.org}
                    onChange={(e) => updateConfig('org', e.target.value)}
                    placeholder="公司名称"
                    className="w-full bg-[var(--glass-surface-hover)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-color)] transition-colors"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 样式设置 */}
          <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-3xl p-6 backdrop-blur-2xl">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2 mb-4">
              <Palette size={18} className="text-[var(--accent-color)]" />
              样式设置
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  尺寸
                </label>
                <input
                  type="number"
                  value={config.size}
                  onChange={(e) => updateConfig('size', parseInt(e.target.value))}
                  min="100"
                  max="1000"
                  className="w-full bg-[var(--glass-surface-hover)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-color)] transition-colors"
                />
              </div>
              <div></div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  前景色
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={config.color}
                    onChange={(e) => updateConfig('color', e.target.value)}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.color}
                    onChange={(e) => updateConfig('color', e.target.value)}
                    className="flex-1 bg-[var(--glass-surface-hover)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-[var(--text-primary)] font-mono text-sm focus:outline-none focus:border-[var(--accent-color)] transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  背景色
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={config.backgroundColor}
                    onChange={(e) => updateConfig('backgroundColor', e.target.value)}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.backgroundColor}
                    onChange={(e) => updateConfig('backgroundColor', e.target.value)}
                    className="flex-1 bg-[var(--glass-surface-hover)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-[var(--text-primary)] font-mono text-sm focus:outline-none focus:border-[var(--accent-color)] transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧：预览区域 */}
        <div className="space-y-6">
          <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-3xl p-6 backdrop-blur-2xl sticky top-6">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2 mb-6">
              <QrCode size={18} className="text-[var(--accent-color)]" />
              二维码预览
            </h3>

            <div className="flex flex-col items-center">
              <div
                className="p-4 rounded-xl mb-6 flex items-center justify-center"
                style={{ backgroundColor: config.backgroundColor }}
              >
                {qrCode ? (
                  <img
                    src={qrCode}
                    alt="QR Code"
                    className="max-w-full"
                    style={{ width: `${Math.min(config.size, 400)}px`, height: 'auto' }}
                  />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center">
                    <QrCode size={48} className="text-[var(--text-tertiary)]" />
                  </div>
                )}
              </div>

              <div className="flex gap-2 w-full">
                <button
                  onClick={generateQR}
                  className="flex-1 py-3 rounded-xl bg-[var(--glass-surface-hover)] hover:bg-[var(--accent-color)] hover:text-black text-[var(--text-secondary)] transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw size={18} />
                  刷新
                </button>
                <button
                  onClick={copyToClipboard}
                  className={`flex-1 py-3 rounded-xl transition-colors flex items-center justify-center gap-2 ${
                    copied
                      ? 'bg-green-500 text-white'
                      : 'bg-[var(--glass-surface-hover)] hover:bg-[var(--accent-color)] hover:text-black text-[var(--text-secondary)]'
                  }`}
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                  {copied ? '已复制' : '复制内容'}
                </button>
                <button
                  onClick={downloadQR}
                  className="flex-1 py-3 rounded-xl bg-[var(--accent-color)] text-black font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <Download size={18} />
                  下载
                </button>
              </div>
            </div>

            {/* 数据预览 */}
            <div className="mt-6 p-4 rounded-xl bg-[var(--glass-surface-hover)] border border-[var(--glass-border)]">
              <p className="text-xs text-[var(--text-tertiary)] mb-2">二维码数据</p>
              <p className="text-xs font-mono text-[var(--text-secondary)] break-all">
                {generateQRData()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeGenerator;
