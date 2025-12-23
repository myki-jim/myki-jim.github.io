'use client';

import React, { useState } from 'react';
import {
  Copy,
  Trash2,
  RefreshCw,
  Check,
  Download,
  Hash
} from 'lucide-react';

interface UUIDItem {
  id: string;
  uuid: string;
  copied: boolean;
}

const UUIDGenerator: React.FC = () => {
  const [uuids, setUuids] = useState<UUIDItem[]>([]);
  const [quantity, setQuantity] = useState(10);
  const [includeHyphens, setIncludeHyphens] = useState(true);
  const [uppercase, setUppercase] = useState(false);

  // 生成 UUID v4
  const generateUUIDv4 = (): string => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // 降级方案
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  // 格式化 UUID
  const formatUUID = (uuid: string): string => {
    let formatted = uuid;
    if (!includeHyphens) {
      formatted = formatted.replace(/-/g, '');
    }
    if (uppercase) {
      formatted = formatted.toUpperCase();
    }
    return formatted;
  };

  // 批量生成 UUID
  const handleGenerate = () => {
    const newUUIDs: UUIDItem[] = [];
    for (let i = 0; i < quantity; i++) {
      newUUIDs.push({
        id: `${Date.now()}-${i}`,
        uuid: formatUUID(generateUUIDv4()),
        copied: false
      });
    }
    setUuids(newUUIDs);
  };

  // 复制单个 UUID
  const copySingle = (id: string) => {
    const item = uuids.find(u => u.id === id);
    if (item) {
      navigator.clipboard.writeText(item.uuid);
      setUuids(prev => prev.map(u =>
        u.id === id ? { ...u, copied: true } : u
      ));
      setTimeout(() => {
        setUuids(prev => prev.map(u =>
          u.id === id ? { ...u, copied: false } : u
        ));
      }, 2000);
    }
  };

  // 复制全部 UUID
  const copyAll = () => {
    const allUUIDs = uuids.map(u => u.uuid).join('\n');
    navigator.clipboard.writeText(allUUIDs);
    setUuids(prev => prev.map(u => ({ ...u, copied: true })));
    setTimeout(() => {
      setUuids(prev => prev.map(u => ({ ...u, copied: false })));
    }, 2000);
  };

  // 清空所有
  const clearAll = () => {
    setUuids([]);
  };

  // 下载为文件
  const downloadAsFile = (format: 'txt' | 'json' | 'csv') => {
    let content = '';
    let filename = '';
    let mimeType = 'text/plain';

    switch (format) {
      case 'txt':
        content = uuids.map(u => u.uuid).join('\n');
        filename = `uuids-${Date.now()}.txt`;
        break;
      case 'json':
        content = JSON.stringify(uuids.map(u => u.uuid), null, 2);
        filename = `uuids-${Date.now()}.json`;
        mimeType = 'application/json';
        break;
      case 'csv':
        content = 'Index,UUID\n' + uuids.map((u, i) => `${i + 1},${u.uuid}`).join('\n');
        filename = `uuids-${Date.now()}.csv`;
        mimeType = 'text/csv';
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-3">UUID 生成器</h2>
        <p className="text-[var(--text-secondary)]">批量生成 UUID v4（随机），支持自定义格式和导出</p>
      </div>

      <div className="space-y-6">
        {/* 配置区域 */}
        <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-3xl p-6 backdrop-blur-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <Hash size={18} className="text-[var(--accent-color)]" />
              生成配置
            </h3>
            <button
              onClick={clearAll}
              disabled={uuids.length === 0}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-[var(--glass-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 size={14} />
              清空
            </button>
          </div>

          {/* 数量选择 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              生成数量: <span className="text-[var(--accent-color)] font-bold">{quantity}</span>
            </label>
            <input
              type="range"
              min="1"
              max="100"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full h-2 bg-[var(--glass-surface-hover)] rounded-lg appearance-none cursor-pointer accent-[var(--accent-color)]"
            />
            <div className="flex justify-between text-xs text-[var(--text-tertiary)] mt-1">
              <span>1</span>
              <span>50</span>
              <span>100</span>
            </div>
          </div>

          {/* 格式选项 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <label className="flex items-center gap-3 p-4 rounded-xl bg-[var(--glass-surface-hover)] cursor-pointer transition-colors hover:bg-[var(--glass-surface-hover)]">
              <input
                type="checkbox"
                checked={includeHyphens}
                onChange={(e) => setIncludeHyphens(e.target.checked)}
                className="w-5 h-5 rounded accent-[var(--accent-color)]"
              />
              <div className="flex-1">
                <div className="font-medium text-[var(--text-primary)]">包含连字符</div>
                <div className="text-xs text-[var(--text-tertiary)]">例如: 550e8400-e29b-41d4-a716-446655440000</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 rounded-xl bg-[var(--glass-surface-hover)] cursor-pointer transition-colors hover:bg-[var(--glass-surface-hover)]">
              <input
                type="checkbox"
                checked={uppercase}
                onChange={(e) => setUppercase(e.target.checked)}
                className="w-5 h-5 rounded accent-[var(--accent-color)]"
              />
              <div className="flex-1">
                <div className="font-medium text-[var(--text-primary)]">大写字母</div>
                <div className="text-xs text-[var(--text-tertiary)]">例如: 550E8400-E29B-41D4-A716-446655440000</div>
              </div>
            </label>
          </div>

          {/* 生成按钮 */}
          <button
            onClick={handleGenerate}
            className="w-full py-3 rounded-xl bg-[var(--accent-color)] text-black font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <RefreshCw size={18} />
            生成 {quantity} 个 UUID
          </button>
        </div>

        {/* 结果显示 */}
        {uuids.length > 0 && (
          <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-3xl p-6 backdrop-blur-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                已生成的 UUID ({uuids.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={copyAll}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--glass-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm"
                >
                  <Copy size={14} />
                  复制全部
                </button>
                <button
                  onClick={() => downloadAsFile('txt')}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--glass-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm"
                >
                  <Download size={14} />
                  TXT
                </button>
                <button
                  onClick={() => downloadAsFile('json')}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--glass-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm"
                >
                  <Download size={14} />
                  JSON
                </button>
                <button
                  onClick={() => downloadAsFile('csv')}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--glass-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm"
                >
                  <Download size={14} />
                  CSV
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
              {uuids.map((item, index) => (
                <div
                  key={item.id}
                  className="group flex items-center gap-3 p-3 rounded-xl bg-[var(--glass-surface-hover)] border border-[var(--glass-border)] hover:border-[var(--accent-color)] transition-colors"
                >
                  <span className="text-xs text-[var(--text-tertiary)] font-mono w-8 flex-shrink-0">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <code className="flex-1 text-sm text-[var(--text-primary)] font-mono break-all">
                    {item.uuid}
                  </code>
                  <button
                    onClick={() => copySingle(item.id)}
                    className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
                      item.copied
                        ? 'bg-green-500 text-white'
                        : 'hover:bg-[var(--accent-color)] hover:text-black text-[var(--text-secondary)]'
                    }`}
                    title={item.copied ? '已复制' : '复制'}
                  >
                    {item.copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UUIDGenerator;
