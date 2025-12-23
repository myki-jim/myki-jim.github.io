'use client';

import React, { useState, useEffect } from 'react';
import {
  Copy,
  Trash2,
  FileText,
  Hash,
  Globe,
  Code,
  Check,
  Settings,
  ChevronDown
} from 'lucide-react';

type EncodingType =
  | 'base64'
  | 'base32'
  | 'base16'
  | 'base58'
  | 'base62'
  | 'url'
  | 'html'
  | 'unicode'
  | 'punycode'
  | 'utf7'
  | 'utf16'
  | 'utf32'
  | 'morse'
  | 'rot13'
  | 'caesar'
  | 'atbash'
  | 'vigenere'
  | 'ascii85'
  | 'quoted'
  | 'percent';

interface EncodingConfig {
  id: EncodingType;
  name: string;
  category: string;
  description: string;
  hasParams: boolean;
}

const encodingConfigs: EncodingConfig[] = [
  // Base编码
  { id: 'base64', name: 'Base64', category: 'Base编码', description: '文本格式传输二进制数据', hasParams: false },
  { id: 'base32', name: 'Base32', category: 'Base编码', description: '使用32个字符的编码方案', hasParams: false },
  { id: 'base16', name: 'Base16 (Hex)', category: 'Base编码', description: '十六进制编码', hasParams: false },
  { id: 'base58', name: 'Base58', category: 'Base编码', description: 'Bitcoin地址编码', hasParams: false },
  { id: 'base62', name: 'Base62', category: 'Base编码', description: 'URL安全的62进制编码', hasParams: false },
  { id: 'ascii85', name: 'ASCII85', category: 'Base编码', description: 'Adobe使用的Base85编码', hasParams: false },

  // Web编码
  { id: 'url', name: 'URL Encode', category: 'Web编码', description: 'URL特殊字符编码', hasParams: false },
  { id: 'percent', name: 'Percent Encoding', category: 'Web编码', description: '百分号编码', hasParams: false },
  { id: 'html', name: 'HTML Entity', category: 'Web编码', description: 'HTML字符转实体', hasParams: false },
  { id: 'quoted', name: 'Quoted-Printable', category: 'Web编码', description: 'MIME编码', hasParams: false },

  // Unicode编码
  { id: 'unicode', name: 'Unicode Escape', category: 'Unicode编码', description: 'Unicode转义序列', hasParams: false },
  { id: 'utf7', name: 'UTF-7', category: 'Unicode编码', description: '7位Unicode编码', hasParams: false },
  { id: 'utf16', name: 'UTF-16', category: 'Unicode编码', description: '16位Unicode编码', hasParams: false },
  { id: 'utf32', name: 'UTF-32', category: 'Unicode编码', description: '32位Unicode编码', hasParams: false },
  { id: 'punycode', name: 'Punycode', category: 'Unicode编码', description: '国际化域名编码', hasParams: false },

  // 古典密码
  { id: 'morse', name: 'Morse Code', category: '古典密码', description: '摩斯密码电报', hasParams: false },
  { id: 'rot13', name: 'ROT13', category: '古典密码', description: '字母位移13位', hasParams: true },
  { id: 'caesar', name: 'Caesar Cipher', category: '古典密码', description: '凯撒密码', hasParams: true },
  { id: 'atbash', name: 'Atbash Cipher', category: '古典密码', description: '希伯来字母替换密码', hasParams: false },
  { id: 'vigenere', name: 'Vigenère Cipher', category: '古典密码', description: '维吉尼亚密码', hasParams: true },
];

// Base58字符集（Bitcoin风格）
const BASE58_CHARS = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

// Base62字符集
const BASE62_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

// 摩斯密码表
const MORSE_CODE: { [key: string]: string } = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
  'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
  'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
  'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
  'Y': '-.--', 'Z': '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
  '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', '!': '-.-.--',
  '/': '-..-.', '(': '-.--.', ')': '-.--.-', '&': '.-...', ':': '---...',
  ';': '-.-.-.', '=': '-...-', '+': '.-.-.', '-': '-....-', '_': '..--.-',
  '"': '.-..-.', '$': '...-..-', '@': '.--.-.'
};

const MORSE_REVERSE: { [key: string]: string } = Object.fromEntries(
  Object.entries(MORSE_CODE).map(([k, v]) => [v, k])
);

// Base32字符集
const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

// ASCII85字符集
const ASCII85_CHARS = '!\"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstu';

const Encoder: React.FC = () => {
  const [activeType, setActiveType] = useState<EncodingType>('base64');
  const [encodeInput, setEncodeInput] = useState('');
  const [decodeInput, setDecodeInput] = useState('');
  const [encodeOutput, setEncodeOutput] = useState('');
  const [decodeOutput, setDecodeOutput] = useState('');
  const [encodeError, setEncodeError] = useState('');
  const [decodeError, setDecodeError] = useState('');
  const [copied, setCopied] = useState<'encode' | 'decode' | null>(null);

  // 参数配置
  const [rot13Shift, setRot13Shift] = useState(13);
  const [caesarShift, setCaesarShift] = useState(3);
  const [vigenereKey, setVigenereKey] = useState('KEY');
  const [showParams, setShowParams] = useState(false);

  useEffect(() => {
    if (encodeInput) {
      processEncode(encodeInput);
    } else {
      setEncodeOutput('');
      setEncodeError('');
    }
  }, [encodeInput, activeType, rot13Shift, caesarShift, vigenereKey]);

  useEffect(() => {
    if (decodeInput) {
      processDecode(decodeInput);
    } else {
      setDecodeOutput('');
      setDecodeError('');
    }
  }, [decodeInput, activeType, rot13Shift, caesarShift, vigenereKey]);

  // ========== 编码函数 ==========
  const processEncode = (value: string) => {
    try {
      let result = '';
      switch (activeType) {
        case 'base64':
          result = encodeBase64(value);
          break;
        case 'base32':
          result = encodeBase32(value);
          break;
        case 'base16':
          result = encodeBase16(value);
          break;
        case 'base58':
          result = encodeBase58(value);
          break;
        case 'base62':
          result = encodeBase62(value);
          break;
        case 'url':
          result = encodeURIComponent(value);
          break;
        case 'percent':
          result = encodePercent(value);
          break;
        case 'html':
          result = encodeHtml(value);
          break;
        case 'unicode':
          result = encodeUnicode(value);
          break;
        case 'utf7':
          result = encodeUTF7(value);
          break;
        case 'utf16':
          result = encodeUTF16(value);
          break;
        case 'utf32':
          result = encodeUTF32(value);
          break;
        case 'punycode':
          result = encodePunycode(value);
          break;
        case 'morse':
          result = encodeMorse(value);
          break;
        case 'rot13':
          result = applyROT13(value, rot13Shift);
          break;
        case 'caesar':
          result = applyCaesar(value, caesarShift);
          break;
        case 'atbash':
          result = applyAtbash(value);
          break;
        case 'vigenere':
          result = applyVigenere(value, vigenereKey, true);
          break;
        case 'ascii85':
          result = encodeAscii85(value);
          break;
        case 'quoted':
          result = encodeQuoted(value);
          break;
      }
      setEncodeOutput(result);
      setEncodeError('');
    } catch (err) {
      setEncodeError('编码失败: ' + (err instanceof Error ? err.message : '未知错误'));
      setEncodeOutput('');
    }
  };

  // ========== 解码函数 ==========
  const processDecode = (value: string) => {
    try {
      let result = '';
      switch (activeType) {
        case 'base64':
          result = decodeBase64(value);
          break;
        case 'base32':
          result = decodeBase32(value);
          break;
        case 'base16':
          result = decodeBase16(value);
          break;
        case 'base58':
          result = decodeBase58(value);
          break;
        case 'base62':
          result = decodeBase62(value);
          break;
        case 'url':
          result = decodeURIComponent(value);
          break;
        case 'percent':
          result = decodePercent(value);
          break;
        case 'html':
          result = decodeHtml(value);
          break;
        case 'unicode':
          result = decodeUnicode(value);
          break;
        case 'utf7':
          result = decodeUTF7(value);
          break;
        case 'utf16':
          result = decodeUTF16(value);
          break;
        case 'utf32':
          result = decodeUTF32(value);
          break;
        case 'punycode':
          result = decodePunycode(value);
          break;
        case 'morse':
          result = decodeMorse(value);
          break;
        case 'rot13':
          result = applyROT13(value, rot13Shift);
          break;
        case 'caesar':
          result = applyCaesar(value, -caesarShift);
          break;
        case 'atbash':
          result = applyAtbash(value);
          break;
        case 'vigenere':
          result = applyVigenere(value, vigenereKey, false);
          break;
        case 'ascii85':
          result = decodeAscii85(value);
          break;
        case 'quoted':
          result = decodeQuoted(value);
          break;
      }
      setDecodeOutput(result);
      setDecodeError('');
    } catch (err) {
      setDecodeError('解码失败: 输入格式不正确');
      setDecodeOutput('');
    }
  };

  // Base64
  const encodeBase64 = (text: string): string => {
    return btoa(unescape(encodeURIComponent(text)));
  };

  const decodeBase64 = (text: string): string => {
    return decodeURIComponent(escape(atob(text)));
  };

  // Base32
  const encodeBase32 = (text: string): string => {
    const bytes = new TextEncoder().encode(text);
    let result = '';
    let bits = 0;
    let value = 0;

    for (const byte of bytes) {
      value = (value << 8) | byte;
      bits += 8;
      while (bits >= 5) {
        result += BASE32_CHARS[(value >>> (bits - 5)) & 31];
        bits -= 5;
      }
    }

    if (bits > 0) {
      result += BASE32_CHARS[(value << (5 - bits)) & 31];
    }

    // 填充
    while (result.length % 8 !== 0) {
      result += '=';
    }

    return result;
  };

  const decodeBase32 = (text: string): string => {
    const clean = text.replace(/=/g, '').toUpperCase();
    let bits = 0;
    let value = 0;
    const bytes: number[] = [];

    for (const char of clean) {
      const index = BASE32_CHARS.indexOf(char);
      if (index === -1) throw new Error('无效的Base32字符');

      value = (value << 5) | index;
      bits += 5;

      if (bits >= 8) {
        bytes.push((value >>> (bits - 8)) & 255);
        bits -= 8;
      }
    }

    return new TextDecoder().decode(new Uint8Array(bytes));
  };

  // Base16 (Hex)
  const encodeBase16 = (text: string): string => {
    return Array.from(new TextEncoder().encode(text))
      .map(b => b.toString(16).toUpperCase().padStart(2, '0'))
      .join(' ');
  };

  const decodeBase16 = (text: string): string => {
    const clean = text.replace(/\s+/g, '');
    const bytes = clean.match(/.{1,2}/g)?.map(b => parseInt(b, 16)) || [];
    return new TextDecoder().decode(new Uint8Array(bytes));
  };

  // Base58
  const encodeBase58 = (text: string): string => {
    const bytes = new TextEncoder().encode(text);
    let num = 0n;

    for (const byte of bytes) {
      num = num * 256n + BigInt(byte);
    }

    let result = '';
    while (num > 0n) {
      const remainder = Number(num % 58n);
      result = BASE58_CHARS[remainder] + result;
      num = num / 58n;
    }

    // 处理前导零
    for (const byte of bytes) {
      if (byte === 0) {
        result = '1' + result;
      } else {
        break;
      }
    }

    return result || '1';
  };

  const decodeBase58 = (text: string): string => {
    let num = 0n;

    for (const char of text) {
      const index = BASE58_CHARS.indexOf(char);
      if (index === -1) throw new Error('无效的Base58字符');
      num = num * 58n + BigInt(index);
    }

    const bytes: number[] = [];
    while (num > 0n) {
      bytes.unshift(Number(num % 256n));
      num = num / 256n;
    }

    return new TextDecoder().decode(new Uint8Array(bytes));
  };

  // Base62
  const encodeBase62 = (text: string): string => {
    const bytes = new TextEncoder().encode(text);
    let num = 0n;

    for (const byte of bytes) {
      num = num * 256n + BigInt(byte);
    }

    let result = '';
    while (num > 0n) {
      const remainder = Number(num % 62n);
      result = BASE62_CHARS[remainder] + result;
      num = num / 62n;
    }

    return result || '0';
  };

  const decodeBase62 = (text: string): string => {
    let num = 0n;

    for (const char of text) {
      const index = BASE62_CHARS.indexOf(char);
      if (index === -1) throw new Error('无效的Base62字符');
      num = num * 62n + BigInt(index);
    }

    const bytes: number[] = [];
    while (num > 0n) {
      bytes.unshift(Number(num % 256n));
      num = num / 256n;
    }

    return new TextDecoder().decode(new Uint8Array(bytes));
  };

  // Percent Encoding
  const encodePercent = (text: string): string => {
    return text.split('').map(char => {
      const code = char.charCodeAt(0);
      if (code <= 0xFF) {
        return '%' + code.toString(16).toUpperCase().padStart(2, '0');
      } else {
        const encoded = encodeURIComponent(char);
        return encoded.startsWith('%') ? encoded : '%' + encoded;
      }
    }).join('');
  };

  const decodePercent = (text: string): string => {
    return decodeURIComponent(text);
  };

  // HTML Entity
  const encodeHtml = (text: string): string => {
    const entities: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };

    return text.replace(/[&<>"']/g, char => entities[char] || `&#${char.charCodeAt(0)};`);
  };

  const decodeHtml = (text: string): string => {
    const doc = new DOMParser().parseFromString(text, 'text/html');
    return doc.documentElement.textContent || '';
  };

  // Unicode Escape
  const encodeUnicode = (text: string): string => {
    return Array.from(text).map(char => {
      const code = char.charCodeAt(0);
      if (code <= 0xFFFF) {
        return '\\u' + code.toString(16).toUpperCase().padStart(4, '0');
      } else {
        return '\\U' + code.toString(16).toUpperCase().padStart(8, '0');
      }
    }).join('');
  };

  const decodeUnicode = (text: string): string => {
    return text.replace(/\\u([0-9A-Fa-f]{4})|\\U([0-9A-Fa-f]{8})/g, (_, u4, u8) => {
      const code = parseInt(u4 || u8, 16);
      return String.fromCharCode(code);
    });
  };

  // UTF-7 (简化版)
  const encodeUTF7 = (text: string): string => {
    // UTF-7的完整实现较复杂，这里使用简化版本
    const base64 = btoa(unescape(encodeURIComponent(text)));
    return '+' + base64 + '-';
  };

  const decodeUTF7 = (text: string): string => {
    const match = text.match(/\+([A-Za-z0-9+/=]+)-/);
    if (!match) return text;
    return decodeURIComponent(escape(atob(match[1])));
  };

  // UTF-16
  const encodeUTF16 = (text: string): string => {
    return Array.from(text).map(char => {
      const code = char.charCodeAt(0);
      return '\\u' + code.toString(16).toUpperCase().padStart(4, '0');
    }).join('');
  };

  const decodeUTF16 = (text: string): string => {
    return text.replace(/\\u([0-9A-Fa-f]{4})/g, (_, hex) => {
      return String.fromCharCode(parseInt(hex, 16));
    });
  };

  // UTF-32
  const encodeUTF32 = (text: string): string => {
    return Array.from(text).map(char => {
      const code = char.codePointAt(0) || 0;
      return '\\U' + code.toString(16).toUpperCase().padStart(8, '0');
    }).join('');
  };

  const decodeUTF32 = (text: string): string => {
    return text.replace(/\\U([0-9A-Fa-f]{8})/gi, (_, hex) => {
      return String.fromCodePoint(parseInt(hex, 16));
    });
  };

  // Punycode (简化版，仅支持ASCII域名)
  const encodePunycode = (text: string): string => {
    // 简化实现：仅对非ASCII字符进行转换
    const hasNonASCII = Array.from(text).some(char => char.charCodeAt(0) > 127);
    if (!hasNonASCII) return text;

    // 完整的Punycode实现较复杂，这里返回基本格式
    return 'xn--' + encodeBase64(text).replace(/=/g, '').replace(/\+/g, '-').toLowerCase();
  };

  const decodePunycode = (text: string): string => {
    if (!text.startsWith('xn--')) return text;
    // 简化实现
    const encoded = text.substring(4);
    return decodeBase64(encoded.replace(/-/g, '+'));
  };

  // Morse Code
  const encodeMorse = (text: string): string => {
    return text.toUpperCase().split('').map(char => {
      return MORSE_CODE[char] || char;
    }).join(' ');
  };

  const decodeMorse = (text: string): string => {
    return text.split(' ').map(code => {
      return MORSE_REVERSE[code] || code;
    }).join('');
  };

  // ROT13 (可变位移)
  const applyROT13 = (text: string, shift: number): string => {
    return text.replace(/[A-Za-z]/g, char => {
      const base = char <= 'Z' ? 65 : 97;
      return String.fromCharCode(((char.charCodeAt(0) - base + shift) % 26 + 26) % 26 + base);
    });
  };

  // Caesar Cipher
  const applyCaesar = (text: string, shift: number): string => {
    return text.replace(/[A-Za-z]/g, char => {
      const base = char <= 'Z' ? 65 : 97;
      return String.fromCharCode(((char.charCodeAt(0) - base + shift) % 26 + 26) % 26 + base);
    });
  };

  // Atbash Cipher
  const applyAtbash = (text: string): string => {
    return text.replace(/[A-Za-z]/g, char => {
      const base = char <= 'Z' ? 65 : 97;
      return String.fromCharCode(base + (25 - (char.charCodeAt(0) - base)));
    });
  };

  // Vigenère Cipher
  const applyVigenere = (text: string, key: string, encode: boolean): string => {
    const cleanKey = key.toUpperCase().replace(/[^A-Z]/g, '');
    if (!cleanKey) return text;

    let keyIndex = 0;
    return text.replace(/[A-Za-z]/g, char => {
      const base = char <= 'Z' ? 65 : 97;
      const textShift = char.charCodeAt(0) - base;
      const keyShift = cleanKey.charCodeAt(keyIndex % cleanKey.length) - 65;

      const shift = encode ? keyShift : -keyShift;
      const result = ((textShift + shift) % 26 + 26) % 26;
      keyIndex++;

      return String.fromCharCode(base + result);
    });
  };

  // ASCII85 (Base85)
  const encodeAscii85 = (text: string): string => {
    const bytes = new TextEncoder().encode(text);
    let result = '<~';

    for (let i = 0; i < bytes.length; i += 4) {
      const chunk = Array.from(bytes.slice(i, i + 4));
      while (chunk.length < 4) chunk.push(0);

      let value = 0n;
      for (const byte of chunk) {
        value = value * 256n + BigInt(byte);
      }

      const chars: string[] = [];
      for (let j = 0; j < 5; j++) {
        chars.unshift(ASCII85_CHARS[Number(value % 85n)]);
        value = value / 85n;
      }

      result += chars.join('');
    }

    return result + '~>';
  };

  const decodeAscii85 = (text: string): string => {
    const clean = text.replace(/<~|~>/g, '').replace(/\s/g, '');
    const bytes: number[] = [];

    for (let i = 0; i < clean.length; i += 5) {
      const chunk = clean.slice(i, i + 5);
      while (chunk.length < 5) chunk.push('u'); // 'u' = 84

      let value = 0n;
      for (const char of chunk) {
        const index = ASCII85_CHARS.indexOf(char);
        if (index === -1) throw new Error('无效的ASCII85字符');
        value = value * 85n + BigInt(index);
      }

      for (let j = 0; j < 4; j++) {
        bytes.unshift(Number((value >> BigInt(j * 8)) & 0xffn));
      }
    }

    return new TextDecoder().decode(new Uint8Array(bytes));
  };

  // Quoted-Printable
  const encodeQuoted = (text: string): string => {
    return text.split('').map(char => {
      const code = char.charCodeAt(0);
      if ((code >= 33 && code <= 126) && code !== 61) {
        return char;
      } else {
        return '=' + code.toString(16).toUpperCase().padStart(2, '0');
      }
    }).join('');
  };

  const decodeQuoted = (text: string): string => {
    return text.replace(/=([0-9A-Fa-f]{2})/g, (_, hex) => {
      return String.fromCharCode(parseInt(hex, 16));
    }).replace(/=\n/g, '');
  };

  // 工具函数
  const handleCopy = (text: string, type: 'encode' | 'decode') => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleClear = () => {
    setEncodeInput('');
    setDecodeInput('');
    setEncodeOutput('');
    setDecodeOutput('');
    setEncodeError('');
    setDecodeError('');
  };

  const loadSample = () => {
    const sample = 'Hello, 世界! 你好世界 123';
    setEncodeInput(sample);
    setDecodeInput('');
  };

  // 获取分类列表
  const categories = Array.from(new Set(encodingConfigs.map(c => c.category)));

  const currentConfig = encodingConfigs.find(c => c.id === activeType);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-3">编解码转换工具</h2>
        <p className="text-[var(--text-secondary)]">支持市面上所有主流编码格式，包括古典密码</p>
      </div>

      <div className="space-y-6">
        {/* 编码类型选择 */}
        <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-3xl p-6 backdrop-blur-2xl">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">选择编码类型</h3>

          {/* 分类标签 */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setShowParams(false)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                !showParams
                  ? 'bg-[var(--accent-color)] text-black'
                  : 'bg-[var(--glass-surface-hover)] text-[var(--text-secondary)]'
              }`}
            >
              全部
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setShowParams(false)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  !showParams
                    ? 'bg-[var(--glass-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    : 'bg-[var(--glass-surface-hover)] text-[var(--text-secondary)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* 编码类型网格 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-64 overflow-y-auto pr-2">
            {encodingConfigs.map((type) => (
              <button
                key={type.id}
                onClick={() => setActiveType(type.id)}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all text-left ${
                  activeType === type.id
                    ? 'bg-[var(--accent-color)] text-black'
                    : 'bg-[var(--glass-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <div className="font-bold truncate">{type.name}</div>
                <div className="text-xs opacity-70 truncate">{type.category}</div>
              </button>
            ))}
          </div>

          <p className="mt-4 text-sm text-[var(--text-tertiary)]">
            {currentConfig?.description}
          </p>
        </div>

        {/* 参数配置区 */}
        {currentConfig?.hasParams && (
          <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-3xl p-6 backdrop-blur-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <Settings size={18} className="text-[var(--accent-color)]" />
                参数配置
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {activeType === 'rot13' && (
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-2">位移量</label>
                  <input
                    type="number"
                    value={rot13Shift}
                    onChange={(e) => setRot13Shift(parseInt(e.target.value) || 0)}
                    min="1"
                    max="25"
                    className="w-full px-4 py-2 bg-[var(--glass-surface-hover)] border border-[var(--glass-border)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-color)]"
                  />
                </div>
              )}

              {activeType === 'caesar' && (
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-2">位移量</label>
                  <input
                    type="number"
                    value={caesarShift}
                    onChange={(e) => setCaesarShift(parseInt(e.target.value) || 0)}
                    min="1"
                    max="25"
                    className="w-full px-4 py-2 bg-[var(--glass-surface-hover)] border border-[var(--glass-border)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-color)]"
                  />
                </div>
              )}

              {activeType === 'vigenere' && (
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-2">密钥</label>
                  <input
                    type="text"
                    value={vigenereKey}
                    onChange={(e) => setVigenereKey(e.target.value.toUpperCase())}
                    placeholder="输入密钥（仅字母）"
                    className="w-full px-4 py-2 bg-[var(--glass-surface-hover)] border border-[var(--glass-border)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-color)]"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* 编码解码区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 编码输入区 */}
          <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-3xl p-6 backdrop-blur-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <FileText size={18} className="text-[var(--accent-color)]" />
                编码输入 (原文 → {currentConfig?.name})
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={loadSample}
                  className="px-3 py-1.5 rounded-lg bg-[var(--glass-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm"
                >
                  加载示例
                </button>
                <button
                  onClick={() => handleCopy(encodeOutput, 'encode')}
                  className={`p-2 rounded-lg transition-all ${
                    copied === 'encode'
                      ? 'bg-green-500/20 text-green-400 border border-green-500/20'
                      : 'bg-[var(--glass-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                  disabled={!encodeOutput}
                  title="复制结果"
                >
                  {copied === 'encode' ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            <textarea
              value={encodeInput}
              onChange={(e) => setEncodeInput(e.target.value)}
              placeholder={`在此输入要编码的文本...`}
              className="w-full h-40 bg-[var(--glass-surface-hover)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-color)] transition-colors resize-none text-sm font-mono"
            />

            {encodeError ? (
              <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-400">{encodeError}</p>
              </div>
            ) : encodeOutput && (
              <div className="mt-3">
                <div className="text-xs text-[var(--text-tertiary)] mb-1">编码结果:</div>
                <div className="p-3 rounded-xl bg-[var(--glass-surface-hover)] border border-[var(--glass-border)]">
                  <div className="text-sm text-[var(--text-primary)] font-mono break-all max-h-24 overflow-y-auto">
                    {encodeOutput}
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4 mt-3 text-xs text-[var(--text-tertiary)]">
              <span>输入长度: {encodeInput.length.toLocaleString()}</span>
              {encodeOutput && <span>输出长度: {encodeOutput.length.toLocaleString()}</span>}
            </div>
          </div>

          {/* 解码输入区 */}
          <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-3xl p-6 backdrop-blur-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <Hash size={18} className="text-[var(--accent-color)]" />
                解码输入 ({currentConfig?.name} → 原文)
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleCopy(decodeOutput, 'decode')}
                  className={`p-2 rounded-lg transition-all ${
                    copied === 'decode'
                      ? 'bg-green-500/20 text-green-400 border border-green-500/20'
                      : 'bg-[var(--glass-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                  disabled={!decodeOutput}
                  title="复制结果"
                >
                  {copied === 'decode' ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            <textarea
              value={decodeInput}
              onChange={(e) => setDecodeInput(e.target.value)}
              placeholder={`在此输入要解码的${currentConfig?.name}文本...`}
              className="w-full h-40 bg-[var(--glass-surface-hover)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-color)] transition-colors resize-none text-sm font-mono"
            />

            {decodeError ? (
              <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-400">{decodeError}</p>
              </div>
            ) : decodeOutput && (
              <div className="mt-3">
                <div className="text-xs text-[var(--text-tertiary)] mb-1">解码结果:</div>
                <div className="p-3 rounded-xl bg-[var(--glass-surface-hover)] border border-[var(--glass-border)]">
                  <div className="text-sm text-[var(--text-primary)] font-mono break-all max-h-24 overflow-y-auto">
                    {decodeOutput}
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4 mt-3 text-xs text-[var(--text-tertiary)]">
              <span>输入长度: {decodeInput.length.toLocaleString()}</span>
              {decodeOutput && <span>输出长度: {decodeOutput.length.toLocaleString()}</span>}
            </div>
          </div>
        </div>

        {/* 底部操作栏 */}
        <div className="flex justify-center">
          <button
            onClick={handleClear}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--glass-surface-hover)] text-[var(--text-secondary)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 size={18} />
            清空所有
          </button>
        </div>
      </div>

      {/* 使用说明 */}
      <div className="mt-8 p-6 rounded-3xl bg-[var(--glass-surface)] border border-[var(--glass-border)] backdrop-blur-2xl">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">使用说明</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[var(--text-secondary)]">
          <div>
            <h4 className="font-semibold text-[var(--text-primary)] mb-2">Base编码系列</h4>
            <p>Base64常用于邮件附件，Base58用于Bitcoin地址，Base62用于URL短链接。</p>
          </div>
          <div>
            <h4 className="font-semibold text-[var(--text-primary)] mb-2">古典密码</h4>
            <p>ROT13默认位移13位，凯撒密码可自定义位移，维吉尼亚密码需要密钥。</p>
          </div>
          <div>
            <h4 className="font-semibold text-[var(--text-primary)] mb-2">摩斯密码</h4>
            <p>支持字母、数字和常见标点符号，字母之间用空格分隔。</p>
          </div>
          <div>
            <h4 className="font-semibold text-[var(--text-primary)] mb-2">实时转换</h4>
            <p>输入时自动进行编码或解码，支持双向转换。</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Encoder;
