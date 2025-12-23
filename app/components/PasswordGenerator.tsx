'use client';

import React, { useState, useEffect } from 'react';
import {
  Copy,
  Check,
  RefreshCw,
  Shield,
  Eye,
  EyeOff,
  Trash2,
  Clock,
  AlertCircle,
  Settings
} from 'lucide-react';

interface PasswordHistory {
  password: string;
  timestamp: number;
  strength: string;
}

const PasswordGenerator: React.FC = () => {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [showPassword, setShowPassword] = useState(true);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<PasswordHistory[]>([]);
  const [strength, setStrength] = useState({ score: 0, label: '', color: '' });

  // 计算密码强度
  const calculateStrength = (pwd: string) => {
    if (!pwd) {
      return { score: 0, label: '请生成密码', color: 'bg-[var(--text-tertiary)]' };
    }

    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (pwd.length >= 16) score++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;

    if (score <= 2) {
      return { score, label: '弱', color: 'bg-red-500' };
    } else if (score <= 4) {
      return { score, label: '中等', color: 'bg-yellow-500' };
    } else {
      return { score, label: '强', color: 'bg-green-500' };
    }
  };

  // 生成密码
  const generatePassword = () => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const ambiguous = '0Oo1Il';

    let charset = '';
    if (includeUppercase) charset += uppercase;
    if (includeLowercase) charset += lowercase;
    if (includeNumbers) charset += numbers;
    if (includeSymbols) charset += symbols;

    if (excludeAmbiguous) {
      for (const char of ambiguous) {
        charset = charset.replace(new RegExp(`\\${char}`, 'g'), '');
      }
    }

    if (charset === '') {
      setPassword('');
      return;
    }

    let generatedPassword = '';
    const array = new Uint32Array(length);
    if (typeof crypto !== 'undefined') {
      crypto.getRandomValues(array);
    } else {
      for (let i = 0; i < length; i++) {
        array[i] = Math.floor(Math.random() * 0xFFFFFFFF);
      }
    }

    for (let i = 0; i < length; i++) {
      generatedPassword += charset[array[i] % charset.length];
    }

    setPassword(generatedPassword);
    setStrength(calculateStrength(generatedPassword));
  };

  // 复制密码
  const copyPassword = () => {
    if (password) {
      navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // 添加到历史记录
  const addToHistory = (pwd: string) => {
    if (!pwd) return;

    const newHistory: PasswordHistory = {
      password: pwd,
      timestamp: Date.now(),
      strength: strength.label
    };

    setHistory(prev => {
      const filtered = prev.filter(item => item.password !== pwd);
      return [newHistory, ...filtered].slice(0, 10);
    });
  };

  // 清空历史
  const clearHistory = () => {
    setHistory([]);
  };

  // 从历史记录复制
  const copyFromHistory = (pwd: string) => {
    navigator.clipboard.writeText(pwd);
    setPassword(pwd);
    setStrength(calculateStrength(pwd));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 初始化时生成密码
  useEffect(() => {
    generatePassword();
  }, []);

  // 监听配置变化
  useEffect(() => {
    generatePassword();
  }, [length, includeUppercase, includeLowercase, includeNumbers, includeSymbols, excludeAmbiguous]);

  // 格式化时间
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) return '刚刚';
    if (minutes < 60) return `${minutes} 分钟前`;
    if (hours < 24) return `${hours} 小时前`;
    return date.toLocaleDateString('zh-CN');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-3">密码生成器</h2>
        <p className="text-[var(--text-secondary)]">生成安全的随机密码，支持自定义长度和字符类型</p>
      </div>

      <div className="space-y-6">
        {/* 密码显示区域 */}
        <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-3xl p-6 backdrop-blur-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <Shield size={18} className="text-[var(--accent-color)]" />
              生成的密码
            </h3>
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="p-2 rounded-lg hover:bg-[var(--glass-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              title={showPassword ? '隐藏密码' : '显示密码'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-2xl bg-[var(--glass-surface-hover)] border-2 border-[var(--glass-border)] hover:border-[var(--accent-color)] transition-colors mb-4">
            <div className="flex-1 font-mono text-xl sm:text-2xl tracking-wider break-all text-[var(--text-primary)]">
              {showPassword ? password : '•'.repeat(password.length)}
            </div>
            <button
              onClick={copyPassword}
              disabled={!password}
              className={`p-3 rounded-xl transition-all flex-shrink-0 ${
                copied
                  ? 'bg-green-500 text-white'
                  : 'hover:bg-[var(--accent-color)] hover:text-black bg-[var(--glass-surface-hover)] text-[var(--text-secondary)]'
              } ${!password && 'opacity-50 cursor-not-allowed'}`}
              title={copied ? '已复制' : '复制密码'}
            >
              {copied ? <Check size={20} /> : <Copy size={20} />}
            </button>
          </div>

          {/* 密码强度指示器 */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-3 bg-[var(--glass-surface-hover)] rounded-full overflow-hidden">
              <div
                className={`h-full ${strength.color} transition-all duration-300`}
                style={{ width: `${(strength.score / 6) * 100}%` }}
              />
            </div>
            <div className="text-sm font-medium text-[var(--text-primary)] min-w-[60px] text-right">
              {strength.label}
            </div>
          </div>
        </div>

        {/* 配置区域 */}
        <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-3xl p-6 backdrop-blur-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <Settings size={18} className="text-[var(--accent-color)]" />
              密码配置
            </h3>
            <button
              onClick={() => {
                generatePassword();
                addToHistory(password);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent-color)] text-black font-bold hover:opacity-90 transition-opacity"
            >
              <RefreshCw size={18} />
              重新生成
            </button>
          </div>

          {/* 长度滑块 */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-[var(--text-primary)]">
                密码长度
              </label>
              <span className="text-2xl font-bold text-[var(--accent-color)]">{length}</span>
            </div>
            <input
              type="range"
              min="8"
              max="128"
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full h-2 bg-[var(--glass-surface-hover)] rounded-lg appearance-none cursor-pointer accent-[var(--accent-color)]"
            />
            <div className="flex justify-between text-xs text-[var(--text-tertiary)] mt-1">
              <span>8</span>
              <span>64</span>
              <span>128</span>
            </div>
          </div>

          {/* 字符类型选项 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex items-center gap-3 p-4 rounded-xl bg-[var(--glass-surface-hover)] cursor-pointer transition-colors hover:bg-[var(--glass-surface-hover)]">
              <input
                type="checkbox"
                checked={includeUppercase}
                onChange={(e) => setIncludeUppercase(e.target.checked)}
                className="w-5 h-5 rounded accent-[var(--accent-color)]"
              />
              <div className="flex-1">
                <div className="font-medium text-[var(--text-primary)]">大写字母</div>
                <code className="text-xs text-[var(--text-tertiary)]">A-Z</code>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 rounded-xl bg-[var(--glass-surface-hover)] cursor-pointer transition-colors hover:bg-[var(--glass-surface-hover)]">
              <input
                type="checkbox"
                checked={includeLowercase}
                onChange={(e) => setIncludeLowercase(e.target.checked)}
                className="w-5 h-5 rounded accent-[var(--accent-color)]"
              />
              <div className="flex-1">
                <div className="font-medium text-[var(--text-primary)]">小写字母</div>
                <code className="text-xs text-[var(--text-tertiary)]">a-z</code>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 rounded-xl bg-[var(--glass-surface-hover)] cursor-pointer transition-colors hover:bg-[var(--glass-surface-hover)]">
              <input
                type="checkbox"
                checked={includeNumbers}
                onChange={(e) => setIncludeNumbers(e.target.checked)}
                className="w-5 h-5 rounded accent-[var(--accent-color)]"
              />
              <div className="flex-1">
                <div className="font-medium text-[var(--text-primary)]">数字</div>
                <code className="text-xs text-[var(--text-tertiary)]">0-9</code>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 rounded-xl bg-[var(--glass-surface-hover)] cursor-pointer transition-colors hover:bg-[var(--glass-surface-hover)]">
              <input
                type="checkbox"
                checked={includeSymbols}
                onChange={(e) => setIncludeSymbols(e.target.checked)}
                className="w-5 h-5 rounded accent-[var(--accent-color)]"
              />
              <div className="flex-1">
                <div className="font-medium text-[var(--text-primary)]">特殊符号</div>
                <code className="text-xs text-[var(--text-tertiary)]">!@#$%^&*...</code>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 rounded-xl bg-[var(--glass-surface-hover)] cursor-pointer transition-colors hover:bg-[var(--glass-surface-hover)] sm:col-span-2">
              <input
                type="checkbox"
                checked={excludeAmbiguous}
                onChange={(e) => setExcludeAmbiguous(e.target.checked)}
                className="w-5 h-5 rounded accent-[var(--accent-color)]"
              />
              <div className="flex-1">
                <div className="font-medium text-[var(--text-primary)]">排除易混淆字符</div>
                <code className="text-xs text-[var(--text-tertiary)]">0 O o 1 I l</code>
              </div>
            </label>
          </div>

          {/* 警告提示 */}
          {!includeUppercase && !includeLowercase && !includeNumbers && !includeSymbols && (
            <div className="mt-4 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
              <div className="flex items-start gap-2">
                <AlertCircle size={18} className="text-yellow-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-500">
                  请至少选择一种字符类型
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 历史记录 */}
        {history.length > 0 && (
          <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-3xl p-6 backdrop-blur-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <Clock size={18} className="text-[var(--accent-color)]" />
                生成历史 ({history.length})
              </h3>
              <button
                onClick={clearHistory}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-[var(--glass-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm"
              >
                <Trash2 size={14} />
                清空
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
              {history.map((item, index) => (
                <div
                  key={index}
                  className="group flex items-center gap-3 p-3 rounded-xl bg-[var(--glass-surface-hover)] border border-[var(--glass-border)] hover:border-[var(--accent-color)] transition-colors"
                >
                  <div className="flex-1 font-mono text-sm text-[var(--text-primary)] break-all">
                    {item.password}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs px-2 py-1 rounded-md ${
                      item.strength === '强' ? 'bg-green-500/20 text-green-500' :
                      item.strength === '中等' ? 'bg-yellow-500/20 text-yellow-500' :
                      'bg-red-500/20 text-red-500'
                    }`}>
                      {item.strength}
                    </span>
                    <span className="text-xs text-[var(--text-tertiary)]">
                      {formatTime(item.timestamp)}
                    </span>
                    <button
                      onClick={() => copyFromHistory(item.password)}
                      className="p-2 rounded-lg hover:bg-[var(--accent-color)] hover:text-black text-[var(--text-secondary)] transition-colors opacity-0 group-hover:opacity-100"
                      title="复制此密码"
                    >
                      <Copy size={14} />
                    </button>
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

export default PasswordGenerator;
