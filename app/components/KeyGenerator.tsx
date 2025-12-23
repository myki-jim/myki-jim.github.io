'use client';

import React, { useState } from 'react';
import {
  Copy,
  Download,
  Key,
  Shield,
  Fingerprint,
  Check,
  RefreshCw,
  FileText,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Info
} from 'lucide-react';

type KeyFormat = 'PKCS1' | 'PKCS8';
type KeyLength = 2048 | 4096;

interface KeyPair {
  publicKey: string;
  privateKey: string;
  fingerprint: string;
  keyId: string;
  modulusLength: KeyLength;
  format: KeyFormat;
}

const KeyGenerator: React.FC = () => {
  const [keyPair, setKeyPair] = useState<KeyPair | null>(null);
  const [keyLength, setKeyLength] = useState<KeyLength>(2048);
  const [format, setFormat] = useState<KeyFormat>('PKCS1');
  const [copiedKey, setCopiedKey] = useState<'public' | 'private' | 'fingerprint' | null>(null);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // ArrayBuffer to Base64
  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  // Convert JWK to PEM
  const jwkToPem = async (jwk: JsonWebKey, isPublic: boolean, keyFormat: KeyFormat): Promise<string> => {
    try {
      // Import the key
      const algorithm = {
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-256',
      };

      const key = await crypto.subtle.importKey(
        'jwk',
        jwk,
        algorithm,
        true,
        isPublic ? ['verify'] : ['sign']
      );

      // Export to SPKI (public) or PKCS8 (private)
      const format = isPublic ? 'spki' : 'pkcs8';
      const exported = await crypto.subtle.exportKey(format, key);

      const base64 = arrayBufferToBase64(exported);

      if (isPublic) {
        // Public key always uses SPKI format
        return `-----BEGIN PUBLIC KEY-----\n${base64.match(/.{1,64}/g)?.join('\n') || base64}\n-----END PUBLIC KEY-----`;
      } else {
        // Private key: PKCS#1 format uses different header/footer
        if (keyFormat === 'PKCS1') {
          return `-----BEGIN RSA PRIVATE KEY-----\n${base64.match(/.{1,64}/g)?.join('\n') || base64}\n-----END RSA PRIVATE KEY-----`;
        } else {
          return `-----BEGIN PRIVATE KEY-----\n${base64.match(/.{1,64}/g)?.join('\n') || base64}\n-----END PRIVATE KEY-----`;
        }
      }
    } catch (error) {
      console.error('PEM 转换失败:', error);
      throw new Error(`密钥格式转换失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  // Generate key fingerprint
  const generateFingerprint = async (publicKeyJwk: JsonWebKey): Promise<string> => {
    const publicKeyData = JSON.stringify(publicKeyJwk);
    const encoder = new TextEncoder();
    const data = encoder.encode(publicKeyData);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex.substring(0, 32).toUpperCase();
  };

  // Generate RSA key pair
  const generateKeyPair = async () => {
    setIsGenerating(true);
    try {
      // Step 1: Generate key pair
      console.log('开始生成 RSA 密钥对...');
      const keyPairObject = await crypto.subtle.generateKey(
        {
          name: 'RSASSA-PKCS1-v1_5',
          modulusLength: keyLength,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: 'SHA-256',
        },
        true,
        ['sign', 'verify']
      );
      console.log('密钥对生成成功');

      // Step 2: Export to JWK format
      console.log('导出密钥到 JWK 格式...');
      const publicKeyJwk = await crypto.subtle.exportKey('jwk', keyPairObject.publicKey);
      const privateKeyJwk = await crypto.subtle.exportKey('jwk', keyPairObject.privateKey);
      console.log('JWK 导出成功');

      // Step 3: Convert to PEM format
      console.log('转换为 PEM 格式...');
      const publicKey = await jwkToPem(publicKeyJwk, true, format);
      const privateKey = await jwkToPem(privateKeyJwk, false, format);
      console.log('PEM 转换成功');

      // Step 4: Generate fingerprint and key ID
      const fingerprint = await generateFingerprint(publicKeyJwk);
      const keyId = `KEY-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      // Step 5: Update state
      setKeyPair({
        publicKey,
        privateKey,
        fingerprint,
        keyId,
        modulusLength: keyLength,
        format
      });
      setShowPrivateKey(false);
      console.log('密钥生成完成:', { keyId, fingerprint });
    } catch (error) {
      console.error('生成密钥失败:', error);

      // Provide detailed error message
      let errorMessage = '生成密钥失败';

      if (error instanceof Error) {
        if (error.message.includes('operation')) {
          errorMessage += ': 浏览器不支持 Web Crypto API 操作';
        } else if (error.message.includes('format')) {
          errorMessage += ': 密钥格式转换错误';
        } else if (error.message.includes('length')) {
          errorMessage += ': 不支持的密钥长度';
        } else {
          errorMessage += `: ${error.message}`;
        }
      } else {
        errorMessage += ': 未知错误，请检查浏览器是否支持 Web Crypto API';
      }

      alert(errorMessage + '\n\n建议：\n1. 使用现代浏览器（Chrome、Firefox、Edge、Safari）\n2. 确保浏览器启用 JavaScript\n3. 检查浏览器控制台获取详细错误信息');
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string, keyType: 'public' | 'private') => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyType);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Download key as file
  const downloadKey = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Download both keys
  const downloadKeyPair = () => {
    if (!keyPair) return;
    downloadKey(keyPair.publicKey, `public-${keyPair.keyId}.pem`);
    downloadKey(keyPair.privateKey, `private-${keyPair.keyId}.pem`);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-3">RSA 密钥对生成器</h2>
        <p className="text-[var(--text-secondary)]">生成安全的 RSA 公钥和私钥，支持多种密钥长度和格式</p>
      </div>

      <div className="space-y-6">
        {/* 配置区域 */}
        <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-3xl p-6 backdrop-blur-2xl">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2 mb-6">
            <Key size={18} className="text-[var(--accent-color)]" />
            密钥配置
          </h3>

          {/* 密钥长度选择 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-3">
              密钥长度
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setKeyLength(2048)}
                className={`p-4 rounded-xl transition-all ${
                  keyLength === 2048
                    ? 'bg-[var(--accent-color)] text-black font-bold'
                    : 'bg-[var(--glass-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <div className="text-lg mb-1">2048 位</div>
                <div className="text-xs opacity-80">标准安全性</div>
              </button>
              <button
                onClick={() => setKeyLength(4096)}
                className={`p-4 rounded-xl transition-all ${
                  keyLength === 4096
                    ? 'bg-[var(--accent-color)] text-black font-bold'
                    : 'bg-[var(--glass-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <div className="text-lg mb-1">4096 位</div>
                <div className="text-xs opacity-80">更高安全性</div>
              </button>
            </div>
          </div>

          {/* 密钥格式选择 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-3">
              私钥格式
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setFormat('PKCS1')}
                className={`p-4 rounded-xl transition-all ${
                  format === 'PKCS1'
                    ? 'bg-[var(--accent-color)] text-black font-bold'
                    : 'bg-[var(--glass-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <div className="text-sm font-mono mb-1">PKCS#1</div>
                <div className="text-xs opacity-80">传统格式，兼容性好</div>
              </button>
              <button
                onClick={() => setFormat('PKCS8')}
                className={`p-4 rounded-xl transition-all ${
                  format === 'PKCS8'
                    ? 'bg-[var(--accent-color)] text-black font-bold'
                    : 'bg-[var(--glass-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <div className="text-sm font-mono mb-1">PKCS#8</div>
                <div className="text-xs opacity-80">现代标准格式</div>
              </button>
            </div>
          </div>

          {/* 生成按钮 */}
          <button
            onClick={generateKeyPair}
            disabled={isGenerating}
            className="w-full py-3 rounded-xl bg-[var(--accent-color)] text-black font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <RefreshCw size={18} className={isGenerating ? 'animate-spin' : ''} />
            {isGenerating ? '生成中...' : '生成密钥对'}
          </button>
        </div>

        {/* 密钥信息 */}
        {keyPair && (
          <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-3xl p-6 backdrop-blur-2xl">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2 mb-4">
              <Info size={18} className="text-[var(--accent-color)]" />
              密钥信息
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[var(--glass-surface-hover)]">
                <div className="text-xs text-[var(--text-tertiary)] mb-1">密钥 ID</div>
                <div className="text-sm font-mono text-[var(--text-primary)]">{keyPair.keyId}</div>
              </div>
              <div className="p-4 rounded-xl bg-[var(--glass-surface-hover)]">
                <div className="text-xs text-[var(--text-tertiary)] mb-1">密钥长度</div>
                <div className="text-sm font-bold text-[var(--accent-color)]">{keyPair.modulusLength} 位</div>
              </div>
              <div className="p-4 rounded-xl bg-[var(--glass-surface-hover)]">
                <div className="text-xs text-[var(--text-tertiary)] mb-1">密钥格式</div>
                <div className="text-sm font-mono text-[var(--text-primary)]">{keyPair.format}</div>
              </div>
              <div className="p-4 rounded-xl bg-[var(--glass-surface-hover)] relative group">
                <div className="text-xs text-[var(--text-tertiary)] mb-1">密钥指纹</div>
                <div className="text-sm font-mono text-[var(--text-primary)] pr-8 truncate">{keyPair.fingerprint}</div>
                <button
                  onClick={() => copyToClipboard(keyPair.fingerprint, 'fingerprint')}
                  className={`absolute top-4 right-2 p-1.5 rounded-lg transition-colors ${
                    copiedKey === 'fingerprint'
                      ? 'bg-green-500 text-white'
                      : 'opacity-0 group-hover:opacity-100 hover:bg-[var(--accent-color)] hover:text-black text-[var(--text-secondary)]'
                  }`}
                  title={copiedKey === 'fingerprint' ? '已复制' : '复制指纹'}
                >
                  {copiedKey === 'fingerprint' ? <Check size={12} /> : <Copy size={12} />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 公钥显示 */}
        {keyPair && (
          <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-3xl p-6 backdrop-blur-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <Unlock size={18} className="text-green-400" />
                公钥 (Public Key)
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(keyPair.publicKey, 'public')}
                  className={`p-2 rounded-lg transition-colors flex items-center gap-1 ${
                    copiedKey === 'public'
                      ? 'bg-green-500 text-white'
                      : 'hover:bg-[var(--accent-color)] hover:text-black text-[var(--text-secondary)]'
                  }`}
                  title={copiedKey === 'public' ? '已复制' : '复制公钥'}
                >
                  {copiedKey === 'public' ? <Check size={16} /> : <Copy size={16} />}
                  <span className="text-sm">复制</span>
                </button>
                <button
                  onClick={() => downloadKey(keyPair.publicKey, `public-${keyPair.keyId}.pem`)}
                  className="p-2 rounded-lg hover:bg-[var(--accent-color)] hover:text-black text-[var(--text-secondary)] transition-colors flex items-center gap-1"
                  title="下载公钥"
                >
                  <Download size={16} />
                  <span className="text-sm">下载</span>
                </button>
              </div>
            </div>
            <div className="relative">
              <pre className="w-full bg-[var(--glass-surface-hover)] border border-[var(--glass-border)] rounded-xl p-4 text-xs text-[var(--text-primary)] font-mono overflow-x-auto max-h-48 overflow-y-auto custom-scrollbar">
                {keyPair.publicKey}
              </pre>
            </div>
          </div>
        )}

        {/* 私钥显示 */}
        {keyPair && (
          <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-3xl p-6 backdrop-blur-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <Lock size={18} className="text-red-400" />
                私钥 (Private Key)
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowPrivateKey(!showPrivateKey)}
                  className="p-2 rounded-lg hover:bg-[var(--glass-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1"
                  title={showPrivateKey ? '隐藏私钥' : '显示私钥'}
                >
                  {showPrivateKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  <span className="text-sm">{showPrivateKey ? '隐藏' : '显示'}</span>
                </button>
                <button
                  onClick={() => copyToClipboard(keyPair.privateKey, 'private')}
                  className={`p-2 rounded-lg transition-colors flex items-center gap-1 ${
                    copiedKey === 'private'
                      ? 'bg-green-500 text-white'
                      : 'hover:bg-[var(--accent-color)] hover:text-black text-[var(--text-secondary)]'
                  }`}
                  title={copiedKey === 'private' ? '已复制' : '复制私钥'}
                >
                  {copiedKey === 'private' ? <Check size={16} /> : <Copy size={16} />}
                  <span className="text-sm">复制</span>
                </button>
                <button
                  onClick={() => downloadKey(keyPair.privateKey, `private-${keyPair.keyId}.pem`)}
                  className="p-2 rounded-lg hover:bg-[var(--accent-color)] hover:text-black text-[var(--text-secondary)] transition-colors flex items-center gap-1"
                  title="下载私钥"
                >
                  <Download size={16} />
                  <span className="text-sm">下载</span>
                </button>
              </div>
            </div>
            <div className="relative">
              {showPrivateKey ? (
                <pre className="w-full bg-[var(--glass-surface-hover)] border border-[var(--glass-border)] rounded-xl p-4 text-xs text-[var(--text-primary)] font-mono overflow-x-auto max-h-48 overflow-y-auto custom-scrollbar">
                  {keyPair.privateKey}
                </pre>
              ) : (
                <div className="w-full bg-[var(--glass-surface-hover)] border border-[var(--glass-border)] rounded-xl p-8 flex items-center justify-center">
                  <div className="text-center">
                    <Lock size={48} className="mx-auto text-[var(--text-tertiary)] mb-3" />
                    <p className="text-[var(--text-tertiary)]">私钥已隐藏，点击"显示"按钮查看</p>
                    <p className="text-xs text-[var(--text-tertiary)] mt-2">请妥善保管您的私钥，不要泄露给他人</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 下载全部 */}
        {keyPair && (
          <button
            onClick={downloadKeyPair}
            className="w-full py-4 rounded-xl bg-[var(--glass-surface)] border border-[var(--glass-border)] hover:border-[var(--accent-color)] text-[var(--text-primary)] transition-colors flex items-center justify-center gap-2"
          >
            <Download size={18} />
            下载密钥对（包含公钥和私钥）
          </button>
        )}

        {/* 功能特点 */}
        <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-3xl p-6 backdrop-blur-2xl">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">功能特点</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[var(--glass-surface-hover)]">
              <h4 className="font-bold text-sm text-[var(--accent-color)] mb-2 flex items-center gap-2">
                <Shield size={14} />
                安全生成
              </h4>
              <p className="text-xs text-[var(--text-secondary)]">使用浏览器原生 Web Crypto API 生成，密钥在本地生成，不会上传到服务器</p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--glass-surface-hover)]">
              <h4 className="font-bold text-sm text-[var(--accent-color)] mb-2 flex items-center gap-2">
                <Key size={14} />
                多种格式
              </h4>
              <p className="text-xs text-[var(--text-secondary)]">支持 PKCS#1 和 PKCS#8 两种私钥格式，满足不同场景需求</p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--glass-surface-hover)]">
              <h4 className="font-bold text-sm text-[var(--accent-color)] mb-2 flex items-center gap-2">
                <Fingerprint size={14} />
                密钥指纹
              </h4>
              <p className="text-xs text-[var(--text-secondary)]">自动生成密钥指纹，便于验证和标识密钥对</p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--glass-surface-hover)]">
              <h4 className="font-bold text-sm text-[var(--accent-color)] mb-2 flex items-center gap-2">
                <Copy size={14} />
                一键复制
              </h4>
              <p className="text-xs text-[var(--text-secondary)]">单击即可复制公钥或私钥到剪贴板，方便快捷</p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--glass-surface-hover)]">
              <h4 className="font-bold text-sm text-[var(--accent-color)] mb-2 flex items-center gap-2">
                <Download size={14} />
                文件导出
              </h4>
              <p className="text-xs text-[var(--text-secondary)]">支持将密钥导出为 PEM 格式文件，便于备份和使用</p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--glass-surface-hover)]">
              <h4 className="font-bold text-sm text-[var(--accent-color)] mb-2 flex items-center gap-2">
                <FileText size={14} />
                PEM 格式
              </h4>
              <p className="text-xs text-[var(--text-secondary)]">生成标准的 PEM 格式密钥，兼容 OpenSSH、SSL 等工具</p>
            </div>
          </div>
        </div>

        {/* 关于 RSA */}
        <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-3xl p-6 backdrop-blur-2xl">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <Shield size={18} className="text-[var(--accent-color)]" />
            关于 RSA 密钥
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold text-sm text-[var(--text-primary)] mb-2">什么是 RSA？</h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                RSA（Rivest-Shamir-Adleman）是一种非对称加密算法，使用一对密钥：公钥用于加密，私钥用于解密。公钥可以公开分享，而私钥必须保密。RSA 广泛应用于数字签名、密钥交换和数据加密。
              </p>
            </div>
            <div>
              <h4 className="font-bold text-sm text-[var(--text-primary)] mb-2">使用场景</h4>
              <ul className="text-xs text-[var(--text-secondary)] leading-relaxed space-y-1">
                <li>• SSH 登录认证（GitHub、服务器等）</li>
                <li>• SSL/TLS 证书和 HTTPS</li>
                <li>• 数字签名和身份验证</li>
                <li>• 加密通信和数据传输</li>
                <li>• 代码签名和软件验证</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-4 rounded-xl bg-[var(--glass-surface-hover)]">
            <h4 className="font-bold text-sm text-[var(--text-primary)] mb-2">密钥长度对比</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-[var(--text-secondary)]">
              <div>
                <span className="font-bold text-[var(--accent-color)]">2048 位：</span>
                <span>目前推荐的标准长度，提供足够的安全性，生成速度快，兼容性好。</span>
              </div>
              <div>
                <span className="font-bold text-[var(--accent-color)]">4096 位：</span>
                <span>更高安全级别，适用于高敏感度场景，但生成速度较慢，密钥文件更大。</span>
              </div>
            </div>
          </div>
          <div className="mt-4 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <h4 className="font-bold text-sm text-yellow-400 mb-2 flex items-center gap-2">
              <Lock size={14} />
              安全提示
            </h4>
            <ul className="text-xs text-yellow-200/80 leading-relaxed space-y-1">
              <li>• 私钥非常重要，请妥善保管，不要泄露给他人</li>
              <li>• 建议将私钥备份到安全的地方，如密码管理器</li>
              <li>• 不要在不安全的网络中传输私钥</li>
              <li>• 定期更换密钥对，特别是用于生产环境的密钥</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyGenerator;
