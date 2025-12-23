'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeftRight,
  Copy,
  Trash2,
  FileText,
  Hash,
  Globe,
  Code,
  Binary,
  Check
} from 'lucide-react';

type EncodingType = 'base64' | 'url' | 'html' | 'hex' | 'binary';

interface EncodingConfig {
  id: EncodingType;
  name: string;
  icon: React.ElementType;
  description: string;
}

const encodingTypes: EncodingConfig[] = [
  {
    id: 'base64',
    name: 'Base64',
    icon: Hash,
    description: '文本格式传输二进制数据'
  },
  {
    id: 'url',
    name: 'URL 编码',
    icon: Globe,
    description: 'URL 特殊字符编码'
  },
  {
    id: 'html',
    name: 'HTML 实体',
    icon: Code,
    description: 'HTML 字符转实体'
  },
  {
    id: 'hex',
    name: '十六进制',
    icon: Hash,
    description: '字符转十六进制'
  },
  {
    id: 'binary',
    name: '二进制',
    icon: Binary,
    description: '字符转二进制'
  }
];

const Encoder: React.FC = () => {
  const [activeType, setActiveType] = useState<EncodingType>('base64');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (input) {
      processInput(input);
    } else {
      setOutput('');
      setError('');
    }
  }, [input, activeType]);

  const processInput = (value: string) => {
    try {
      let result = '';
      switch (activeType) {
        case 'base64':
          result = btoa(unescape(encodeURIComponent(value)));
          break;
        case 'url':
          result = encodeURIComponent(value);
          break;
        case 'html':
          result = escapeHtml(value);
          break;
        case 'hex':
          result = stringToHex(value);
          break;
        case 'binary':
          result = stringToBinary(value);
          break;
      }
      setOutput(result);
      setError('');
    } catch (err) {
      setError('编码失败: ' + (err instanceof Error ? err.message : '未知错误'));
      setOutput('');
    }
  };

  const decodeOutput = (value: string) => {
    try {
      let result = '';
      switch (activeType) {
        case 'base64':
          result = decodeURIComponent(escape(atob(value)));
          break;
        case 'url':
          result = decodeURIComponent(value);
          break;
        case 'html':
          result = unescapeHtml(value);
          break;
        case 'hex':
          result = hexToString(value);
          break;
        case 'binary':
          result = binaryToString(value);
          break;
      }
      return result;
    } catch (err) {
      throw new Error('解码失败: 输入格式不正确');
    }
  };

  const escapeHtml = (text: string): string => {
    const htmlEntities: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '©': '&copy;',
      '®': '&reg;',
      '€': '&euro;',
      '¥': '&yen;',
      '£': '&pound;',
      '¢': '&cent;'
    };

    return text.replace(/[&<>"'©®€¥£¢]/g, (char) => htmlEntities[char] || `&#${char.charCodeAt(0)};`);
  };

  const unescapeHtml = (html: string): string => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.documentElement.textContent || '';
  };

  const stringToHex = (text: string): string => {
    return text.split('').map(char => {
      const hex = char.charCodeAt(0).toString(16).toUpperCase();
      return hex.padStart(2, '0');
    }).join(' ');
  };

  const hexToString = (hex: string): string => {
    const cleanHex = hex.replace(/\s+/g, '');
    const chars = cleanHex.match(/.{1,2}/g) || [];
    return chars.map(byte => String.fromCharCode(parseInt(byte, 16))).join('');
  };

  const stringToBinary = (text: string): string => {
    return text.split('').map(char => {
      return char.charCodeAt(0).toString(2).padStart(8, '0');
    }).join(' ');
  };

  const binaryToString = (binary: string): string => {
    const cleanBinary = binary.replace(/\s+/g, '');
    const chars = cleanBinary.match(/.{1,8}/g) || [];
    return chars.map(byte => String.fromCharCode(parseInt(byte, 2))).join('');
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  const handleSwap = () => {
    if (output) {
      try {
        const decoded = decodeOutput(output);
        setInput(decoded);
        setOutput(input);
      } catch (err) {
        setError('无法交换: 输出格式不正确');
      }
    }
  };

  const loadSample = () => {
    const samples: { [key in EncodingType]: string } = {
      base64: '你好，世界！',
      url: 'https://example.com/search?q=测试&page=1',
      html: '<div class="test">Hello & "world" ©</div>',
      hex: 'Hello World',
      binary: 'ABC'
    };
    setInput(samples[activeType]);
  };

  const getOutputLength = () => {
    if (activeType === 'hex') {
      return output.replace(/\s+/g, '').length / 2;
    } else if (activeType === 'binary') {
      return output.replace(/\s+/g, '').length / 8;
    }
    return output.length;
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-3">编解码转换工具</h2>
        <p className="text-[var(--text-secondary)]">支持多种编码格式的实时转换</p>
      </div>

      <div className="space-y-6">
        {/* 编码类型选择 */}
        <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-3xl p-6 backdrop-blur-2xl">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">选择编码类型</h3>
          <div className="flex flex-wrap gap-3">
            {encodingTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setActiveType(type.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                    activeType === type.id
                      ? 'bg-[var(--accent-color)] text-black'
                      : 'bg-[var(--glass-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Icon size={18} />
                  <span>{type.name}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-4 text-sm text-[var(--text-tertiary)]">
            {encodingTypes.find(t => t.id === activeType)?.description}
          </p>
        </div>

        {/* 输入输出区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 输入区域 */}
          <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-3xl p-6 backdrop-blur-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <FileText size={18} className="text-[var(--accent-color)]" />
                输入
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={loadSample}
                  className="px-3 py-1.5 rounded-lg bg-[var(--glass-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm"
                >
                  加载示例
                </button>
                <button
                  onClick={() => handleCopy(input)}
                  className="p-2 rounded-lg bg-[var(--glass-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-50"
                  disabled={!input}
                  title="复制输入"
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`在此输入要编码的文本...`}
              className="w-full h-48 bg-[var(--glass-surface-hover)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-color)] transition-colors resize-none text-sm font-mono"
            />

            <div className="flex gap-4 mt-3 text-xs text-[var(--text-tertiary)]">
              <span>长度: {input.length.toLocaleString()}</span>
              <span>字节: {new Blob([input]).size.toLocaleString()}</span>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleSwap}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--glass-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-color)] hover:text-black transition-all disabled:opacity-50"
                disabled={!input || !output}
              >
                <ArrowLeftRight size={18} />
                交换输入输出
              </button>
              <button
                onClick={handleClear}
                className="px-6 py-3 rounded-xl bg-[var(--glass-surface-hover)] text-[var(--text-secondary)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          {/* 输出区域 */}
          <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-3xl p-6 backdrop-blur-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <Hash size={18} className="text-[var(--accent-color)]" />
                输出 ({encodingTypes.find(t => t.id === activeType)?.name})
              </h3>
              <button
                onClick={() => handleCopy(output)}
                className={`p-2 rounded-lg transition-all ${
                  copied
                    ? 'bg-green-500/20 text-green-400 border border-green-500/20'
                    : 'bg-[var(--glass-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
                disabled={!output}
                title="复制输出"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>

            {error ? (
              <div className="h-48 flex items-center justify-center p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-400 text-center">{error}</p>
              </div>
            ) : (
              <textarea
                value={output}
                readOnly
                placeholder="编码结果将显示在这里..."
                className="w-full h-48 bg-[var(--glass-surface-hover)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-tertiary)] resize-none text-sm font-mono"
              />
            )}

            <div className="flex gap-4 mt-3 text-xs text-[var(--text-tertiary)]">
              <span>长度: {output.length.toLocaleString()}</span>
              {activeType === 'hex' && (
                <span>字符数: {getOutputLength().toLocaleString()}</span>
              )}
              {activeType === 'binary' && (
                <span>字符数: {getOutputLength().toLocaleString()}</span>
              )}
            </div>

            {/* 解码测试 */}
            {output && !error && (
              <div className="mt-4 p-4 rounded-xl bg-[var(--glass-surface-hover)] border border-[var(--glass-border)]">
                <div className="text-xs text-[var(--text-tertiary)] mb-2">解码验证:</div>
                <div className="text-sm text-[var(--text-secondary)] font-mono break-all">
                  {(() => {
                    try {
                      return decodeOutput(output);
                    } catch {
                      return '解码失败';
                    }
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Encoder;
