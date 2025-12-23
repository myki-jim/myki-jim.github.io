'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileJson,
  Check,
  X,
  Copy,
  Trash2,
  Upload,
  FileText,
  Braces,
  Minimize2,
  Maximize2,
  AlertCircle,
  Sparkles
} from 'lucide-react';

interface JSONStats {
  objects: number;
  arrays: number;
  keys: number;
  values: number;
  size: number;
}

const JSONFormatter: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [stats, setStats] = useState<JSONStats>({
    objects: 0,
    arrays: 0,
    keys: 0,
    values: 0,
    size: 0
  });
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (input.trim()) {
      formatJSON();
    } else {
      setOutput('');
      setError('');
      setIsValid(null);
      setStats({
        objects: 0,
        arrays: 0,
        keys: 0,
        values: 0,
        size: 0
      });
    }
  }, [input]);

  const formatJSON = () => {
    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, 2);
      setOutput(formatted);
      setError('');
      setIsValid(true);
      calculateStats(parsed);
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : '未知错误';
      setError(errorMsg);
      setIsValid(false);
      setOutput('');
      setStats({
        objects: 0,
        arrays: 0,
        keys: 0,
        values: 0,
        size: 0
      });
    }
  };

  const calculateStats = (obj: any, depth = 0) => {
    let objects = 0;
    let arrays = 0;
    let keys = 0;
    let values = 0;

    const traverse = (item: any) => {
      if (item === null || item === undefined) {
        values++;
        return;
      }

      if (Array.isArray(item)) {
        arrays++;
        item.forEach(traverse);
      } else if (typeof item === 'object') {
        objects++;
        const entries = Object.entries(item);
        keys += entries.length;
        entries.forEach(([_, value]) => {
          values++;
          traverse(value);
        });
      } else {
        values++;
      }
    };

    traverse(obj);

    setStats({
      objects,
      arrays,
      keys,
      values,
      size: new Blob([output]).size
    });
  };

  const minifyJSON = () => {
    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
      setIsValid(true);
      setError('');
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : '未知错误';
      setError(errorMsg);
      setIsValid(false);
    }
  };

  const beautifyJSON = () => {
    try {
      const parsed = JSON.parse(input);
      const beautified = JSON.stringify(parsed, null, 2);
      setOutput(beautified);
      setIsValid(true);
      setError('');
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : '未知错误';
      setError(errorMsg);
      setIsValid(false);
    }
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setError('');
    setIsValid(null);
    setStats({
      objects: 0,
      arrays: 0,
      keys: 0,
      values: 0,
      size: 0
    });
  };

  const loadSample = () => {
    const sample = {
      "项目": "JSON 格式化工具",
      "版本": "1.0.0",
      "功能": ["格式化", "压缩", "验证"],
      "配置": {
        "主题": "深色",
        "自动格式化": true,
        "显示行号": false
      },
      "统计": {
        "用户数": 1000,
        "评分": 4.8
      }
    };
    setInput(JSON.stringify(sample, null, 2));
  };

  const loadFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setInput(content);
      };
      reader.readAsText(file);
    }
  };

  const parseError = (errorMsg: string) => {
    // Try to extract line and position from error message
    const lineMatch = errorMsg.match(/line (\d+)/);
    const posMatch = errorMsg.match(/position (\d+)/);
    const expectedMatch = errorMsg.match(/Expected (.+?)(?: but |$)/);
    const unexpectedMatch = errorMsg.match(/Unexpected (.+?)(?: in |$)/);

    let location = '';
    let reason = errorMsg;

    if (lineMatch) {
      location = `第 ${lineMatch[1]} 行`;
    }
    if (posMatch) {
      location += location ? `，位置 ${posMatch[1]}` : `位置 ${posMatch[1]}`;
    }

    if (expectedMatch) {
      reason = `期望: ${expectedMatch[1]}`;
    } else if (unexpectedMatch) {
      reason = `意外的: ${unexpectedMatch[1]}`;
    }

    return { location, reason };
  };

  const errorDetails = error ? parseError(error) : null;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-3">JSON 格式化工具</h2>
        <p className="text-[var(--text-secondary)]">格式化、压缩和验证 JSON 数据，实时显示统计信息</p>
      </div>

      <div className="space-y-6">
        {/* 工具栏 */}
        <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-3xl p-4 backdrop-blur-2xl">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={beautifyJSON}
              disabled={!input || isValid === false}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent-color)] text-black font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              title="格式化 JSON（美化）"
            >
              <Sparkles size={16} />
              格式化
            </button>
            <button
              onClick={minifyJSON}
              disabled={!input || isValid === false}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--glass-surface-hover)] text-[var(--text-primary)] hover:text-[var(--accent-color)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              title="压缩 JSON（最小化）"
            >
              <Minimize2 size={16} />
              压缩
            </button>
            <div className="h-8 w-[1px] bg-[var(--glass-border)]" />
            <button
              onClick={loadSample}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--glass-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
            >
              <FileText size={16} />
              加载示例
            </button>
            <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--glass-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer">
              <Upload size={16} />
              <span>上传文件</span>
              <input
                type="file"
                onChange={loadFromFile}
                accept=".json"
                className="hidden"
              />
            </label>
            <button
              onClick={clearAll}
              className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-red-500/10 text-[var(--text-secondary)] hover:text-red-400 transition-all ml-auto"
            >
              <Trash2 size={16} />
              清空
            </button>
          </div>
        </div>

        {/* 双栏显示 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 输入区域 */}
          <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-3xl p-6 backdrop-blur-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <FileJson size={18} />
                输入
              </h3>
              {isValid !== null && (
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm ${
                  isValid
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  {isValid ? <Check size={16} /> : <X size={16} />}
                  {isValid ? '有效' : '无效'}
                </div>
              )}
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="在此输入或粘贴 JSON 数据..."
              className="w-full h-[400px] bg-[var(--glass-surface-hover)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-color)] transition-colors resize-none font-mono text-sm"
            />
            <div className="flex gap-4 mt-3 text-xs text-[var(--text-tertiary)]">
              <span>字符数: {input.length.toLocaleString()}</span>
              <span>字节数: {new Blob([input]).size.toLocaleString()}</span>
            </div>
          </div>

          {/* 输出区域 */}
          <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-3xl p-6 backdrop-blur-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <Braces size={18} />
                输出
              </h3>
              <button
                onClick={copyOutput}
                disabled={!output}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--glass-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {copied ? (
                  <>
                    <Check size={16} />
                    已复制
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    复制
                  </>
                )}
              </button>
            </div>
            <textarea
              value={output}
              readOnly
              placeholder="格式化后的 JSON 将显示在这里..."
              className="w-full h-[400px] bg-[var(--glass-surface-hover)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none transition-colors resize-none font-mono text-sm"
            />
            <div className="flex gap-4 mt-3 text-xs text-[var(--text-tertiary)]">
              <span>字符数: {output.length.toLocaleString()}</span>
              <span>字节数: {new Blob([output]).size.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* 错误提示 */}
        {error && errorDetails && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/5 border border-red-500/20 rounded-3xl p-6"
          >
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-red-400 mb-2">JSON 语法错误</h4>
                <div className="space-y-1 text-sm">
                  <p className="text-[var(--text-secondary)]">
                    <span className="text-red-400 font-medium">位置:</span> {errorDetails.location || '未知'}
                  </p>
                  <p className="text-[var(--text-secondary)]">
                    <span className="text-red-400 font-medium">原因:</span> {errorDetails.reason}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 统计信息 */}
        {isValid && output && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-3xl p-6 backdrop-blur-2xl"
          >
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Maximize2 size={18} />
              JSON 统计信息
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="p-4 rounded-xl bg-[var(--glass-surface-hover)] text-center">
                <div className="text-2xl font-bold text-[var(--accent-color)] mb-1">
                  {stats.objects}
                </div>
                <div className="text-xs text-[var(--text-secondary)]">对象数量</div>
              </div>
              <div className="p-4 rounded-xl bg-[var(--glass-surface-hover)] text-center">
                <div className="text-2xl font-bold text-blue-400 mb-1">
                  {stats.arrays}
                </div>
                <div className="text-xs text-[var(--text-secondary)]">数组数量</div>
              </div>
              <div className="p-4 rounded-xl bg-[var(--glass-surface-hover)] text-center">
                <div className="text-2xl font-bold text-green-400 mb-1">
                  {stats.keys}
                </div>
                <div className="text-xs text-[var(--text-secondary)]">键数量</div>
              </div>
              <div className="p-4 rounded-xl bg-[var(--glass-surface-hover)] text-center">
                <div className="text-2xl font-bold text-purple-400 mb-1">
                  {stats.values}
                </div>
                <div className="text-xs text-[var(--text-secondary)]">值数量</div>
              </div>
              <div className="p-4 rounded-xl bg-[var(--glass-surface-hover)] text-center">
                <div className="text-2xl font-bold text-orange-400 mb-1">
                  {(stats.size / 1024).toFixed(2)} KB
                </div>
                <div className="text-xs text-[var(--text-secondary)]">数据大小</div>
              </div>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default JSONFormatter;
