'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Check,
  Copy,
  Trash2,
  Upload,
  X
} from 'lucide-react';
import MD5 from 'crypto-js/md5';
import SHA1 from 'crypto-js/sha1';
import SHA256 from 'crypto-js/sha256';
import SHA512 from 'crypto-js/sha512';
import SHA3 from 'crypto-js/sha3';
import SHA224 from 'crypto-js/sha224';
import SHA384 from 'crypto-js/sha384';
import RIPEMD160 from 'crypto-js/ripemd160';

interface HashState {
  [key: string]: string;
}

const HashGenerator: React.FC = () => {
  const [input, setInput] = useState('');
  const [hashes, setHashes] = useState<HashState>({});
  const [activeHashes, setActiveHashes] = useState({
    md5: true,
    sha1: true,
    sha256: true,
    sha512: true,
    sha3: false,
    sha224: false,
    sha384: false,
    ripemd160: false
  });

  const hashAlgorithms = [
    { key: 'md5', name: 'MD5', description: '128位' },
    { key: 'sha1', name: 'SHA-1', description: '160位' },
    { key: 'sha224', name: 'SHA-224', description: '224位' },
    { key: 'sha256', name: 'SHA-256', description: '256位' },
    { key: 'sha384', name: 'SHA-384', description: '384位' },
    { key: 'sha512', name: 'SHA-512', description: '512位' },
    { key: 'sha3', name: 'SHA-3', description: '可变长度' },
    { key: 'ripemd160', name: 'RIPEMD-160', description: '160位' }
  ];

  useEffect(() => {
    if (input) {
      generateHashes();
    } else {
      setHashes({});
    }
  }, [input, activeHashes]);

  const generateHashes = () => {
    const newHashes: HashState = {};

    if (activeHashes.md5) newHashes.md5 = MD5(input).toString();
    if (activeHashes.sha1) newHashes.sha1 = SHA1(input).toString();
    if (activeHashes.sha224) newHashes.sha224 = SHA224(input).toString();
    if (activeHashes.sha256) newHashes.sha256 = SHA256(input).toString();
    if (activeHashes.sha384) newHashes.sha384 = SHA384(input).toString();
    if (activeHashes.sha512) newHashes.sha512 = SHA512(input).toString();
    if (activeHashes.sha3) newHashes.sha3 = SHA3(input).toString();
    if (activeHashes.ripemd160) newHashes.ripemd160 = RIPEMD160(input).toString();

    setHashes(newHashes);
  };

  const toggleHash = (algorithm: keyof typeof activeHashes) => {
    setActiveHashes(prev => ({ ...prev, [algorithm]: !prev[algorithm] }));
  };

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
  };

  const clearAll = () => {
    setInput('');
    setHashes({});
  };

  const loadSample = () => {
    setInput('你好，哈希生成器！');
  };

  const generateFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setInput(e.target?.result as string || '');
      };
      reader.readAsText(file);
    }
  };

  const compareHashes = () => {
    const hashValues = Object.values(hashes);
    const uniqueHashes = [...new Set(hashValues)];
    return {
      total: hashValues.length,
      unique: uniqueHashes.length,
      collisions: hashValues.length - uniqueHashes.length
    };
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-3">哈希生成器</h2>
        <p className="text-[var(--text-secondary)]">同时生成多种哈希算法，实时更新结果</p>
      </div>

      <div className="space-y-6">
        {/* 输入区域 */}
        <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-3xl p-6 backdrop-blur-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">输入文本</h3>
            <div className="flex gap-2">
              <button
                onClick={loadSample}
                className="px-3 py-1.5 rounded-lg bg-[var(--glass-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm"
              >
                加载示例
              </button>
              <label className="px-3 py-1.5 rounded-lg bg-[var(--glass-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm cursor-pointer flex items-center gap-1">
                <Upload size={14} />
                <input
                  type="file"
                  onChange={generateFromFile}
                  accept=".txt,.md,.js,.json,.xml,.csv"
                  className="hidden"
                />
                上传文件
              </label>
              <button
                onClick={clearAll}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-[var(--glass-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm"
              >
                <Trash2 size={14} />
                清空
              </button>
            </div>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="在此输入要生成哈希的文本..."
            className="w-full h-32 bg-[var(--glass-surface-hover)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-color)] transition-colors resize-none"
          />
          <div className="flex gap-4 mt-3 text-xs text-[var(--text-tertiary)]">
            <span>字符数: {input.length.toLocaleString()}</span>
            <span>字节数: {new Blob([input]).size.toLocaleString()}</span>
          </div>
        </div>

        {/* 算法选择 */}
        <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-3xl p-6 backdrop-blur-2xl">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">选择哈希算法</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {hashAlgorithms.map(algo => (
              <label
                key={algo.key}
                className={`relative p-4 rounded-xl cursor-pointer transition-all ${
                  activeHashes[algo.key as keyof typeof activeHashes]
                    ? 'bg-[var(--accent-color)] text-black'
                    : 'bg-[var(--glass-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <input
                  type="checkbox"
                  checked={activeHashes[algo.key as keyof typeof activeHashes]}
                  onChange={() => toggleHash(algo.key as keyof typeof activeHashes)}
                  className="sr-only"
                />
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-bold text-sm mb-1">{algo.name}</h4>
                    <p className="text-xs opacity-80">{algo.description}</p>
                  </div>
                  {activeHashes[algo.key as keyof typeof activeHashes] && (
                    <Check size={16} className="flex-shrink-0" />
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* 结果显示 */}
        {Object.keys(hashes).length > 0 && (
          <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-3xl p-6 backdrop-blur-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">生成的哈希值</h3>
              <div className="flex gap-2">
                <span className="text-xs px-2 py-1 rounded-lg bg-[var(--glass-surface-hover)] text-[var(--text-secondary)]">
                  {Object.keys(hashes).length} 种算法
                </span>
                {compareHashes().collisions > 0 && (
                  <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
                    <X size={12} />
                    {compareHashes().collisions} 个冲突
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {hashAlgorithms
                .filter(algo => activeHashes[algo.key as keyof typeof activeHashes] && hashes[algo.key])
                .map(algo => (
                  <div key={algo.key} className="p-4 rounded-xl bg-[var(--glass-surface-hover)] border border-[var(--glass-border)]">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-sm text-[var(--text-primary)]">{algo.name}</h4>
                      <button
                        onClick={() => copyHash(hashes[algo.key]!)}
                        className="p-2 rounded-lg hover:bg-[var(--accent-color)] hover:text-black text-[var(--text-secondary)] transition-colors"
                        title="复制哈希值"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                    <code className="block text-xs text-[var(--text-primary)] break-all mb-2 font-mono">
                      {hashes[algo.key]}
                    </code>
                    <div className="flex gap-3 text-xs text-[var(--text-tertiary)]">
                      <span>长度: {hashes[algo.key]!.length} 字符</span>
                      <span>位数: {hashes[algo.key]!.length * 4} bits</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HashGenerator;
