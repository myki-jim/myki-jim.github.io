'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Copy, Trash2, CheckCircle2, XCircle, Book } from 'lucide-react';

interface RegexMatch {
  match: string;
  index: number;
  groups: string[];
}

interface CommonPattern {
  name: string;
  pattern: string;
  description: string;
}

const RegexTester: React.FC = () => {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState({ g: true, i: false, m: false });
  const [testString, setTestString] = useState('');
  const [matches, setMatches] = useState<RegexMatch[]>([]);
  const [error, setError] = useState('');
  const [highlightedText, setHighlightedText] = useState('');

  const commonPatterns: CommonPattern[] = [
    { name: '电子邮箱', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', description: '邮箱地址' },
    { name: '手机号码（中国）', pattern: '1[3-9]\\d{9}', description: '中国手机号' },
    { name: '固定电话（中国）', pattern: '0\\d{2,3}-?\\d{7,8}', description: '中国固定电话' },
    { name: '身份证号', pattern: '[1-9]\\d{5}(18|19|20)\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])\\d{3}[\\dXx]', description: '18位身份证号' },
    { name: 'HTTP URL', pattern: 'https?:\\/\\/[\\w\\-]+(\\.[\\w\\-]+)+([\\w\\-.,@?^=%&:/~+#]*[\\w\\-@?^=%&/~+#])?', description: 'HTTP/HTTPS网址' },
    { name: 'IPv4 地址', pattern: '\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b', description: 'IPv4地址' },
    { name: '日期 (YYYY-MM-DD)', pattern: '\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])', description: '标准日期格式' },
    { name: '时间 (HH:MM:SS)', pattern: '([01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d', description: '24小时制时间' },
    { name: '十六进制颜色', pattern: '#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})\\b', description: 'CSS颜色代码' },
    { name: '整数', pattern: '-?\\b\\d+\\b', description: '整数（含负数）' },
    { name: '小数', pattern: '-?\\b\\d+\\.\\d+\\b', description: '小数' },
    { name: 'HTML 标签', pattern: '<\\/?[a-zA-Z][a-zA-Z0-9]*(?:\\s[^<>]*)?\\/?>', description: 'HTML标签' },
    { name: '中文字符', pattern: '[\\u4e00-\\u9fa5]', description: '中文字符' },
    { name: '用户名', pattern: '[a-zA-Z0-9_]{3,16}', description: '3-16位用户名' },
    { name: 'UUID/GUID', pattern: '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}', description: 'UUID格式' }
  ];

  useEffect(() => {
    if (pattern && testString) {
      testRegex();
    } else {
      setMatches([]);
      setHighlightedText(testString);
      setError('');
    }
  }, [pattern, flags, testString]);

  const testRegex = () => {
    try {
      const flagString = Object.entries(flags)
        .filter(([_, enabled]) => enabled)
        .map(([flag, _]) => flag)
        .join('');

      const regex = new RegExp(pattern, flagString);
      const foundMatches: RegexMatch[] = [];
      let match: RegExpExecArray | null;

      if (flags.g) {
        while ((match = regex.exec(testString)) !== null) {
          foundMatches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1)
          });
        }
      } else {
        match = regex.exec(testString);
        if (match) {
          foundMatches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1)
          });
        }
      }

      setMatches(foundMatches);
      setError('');
      highlightMatches(foundMatches);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(`正则表达式错误: ${errorMsg}`);
      setMatches([]);
      setHighlightedText(testString);
    }
  };

  const highlightMatches = (foundMatches: RegexMatch[]) => {
    if (!foundMatches.length) {
      setHighlightedText(testString);
      return;
    }

    let highlighted = testString;
    let offset = 0;

    foundMatches.forEach(({ match, index }) => {
      const beforeMatch = highlighted.substring(0, index + offset);
      const afterMatch = highlighted.substring(index + match.length + offset);

      highlighted = beforeMatch +
        `<mark style="background: var(--accent-color); color: black; padding: 2px 4px; border-radius: 4px;">${match}</mark>` +
        afterMatch;

      offset += `<mark style="background: var(--accent-color); color: black; padding: 2px 4px; border-radius: 4px;">`.length + `</mark>`.length;
    });

    setHighlightedText(highlighted);
  };

  const loadPattern = (regexPattern: CommonPattern) => {
    setPattern(regexPattern.pattern);
    setTestString(`${regexPattern.description}\n\n在此处输入测试文本...`);
  };

  const toggleFlag = (flag: keyof typeof flags) => {
    setFlags(prev => ({ ...prev, [flag]: !prev[flag] }));
  };

  const clearAll = () => {
    setPattern('');
    setFlags({ g: true, i: false, m: false });
    setTestString('');
    setMatches([]);
    setError('');
    setHighlightedText('');
  };

  const exportRegex = () => {
    const flagString = Object.entries(flags)
      .filter(([_, enabled]) => enabled)
      .map(([flag, _]) => flag)
      .join('');
    return `/${pattern}/${flagString}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-3">正则表达式测试器</h2>
        <p className="text-[var(--text-secondary)]">实时测试和调试正则表达式，支持常用模式快速加载</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左侧：输入区域 */}
        <div className="space-y-6">
          {/* 正则表达式输入 */}
          <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-3xl p-6 backdrop-blur-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">正则表达式</h3>
              <div className="flex items-center gap-2">
                <code className="text-sm text-[var(--accent-color)] bg-[var(--glass-surface-hover)] px-3 py-1 rounded-lg">
                  {exportRegex()}
                </code>
                <button
                  onClick={() => copyToClipboard(exportRegex())}
                  className="p-2 rounded-lg hover:bg-[var(--glass-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  title="复制"
                >
                  <Copy size={18} />
                </button>
              </div>
            </div>

            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="输入正则表达式..."
              className="w-full bg-[var(--glass-surface-hover)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-color)] transition-colors mb-4"
            />

            {/* Flags */}
            <div className="flex gap-3">
              {[
                { key: 'g' as const, label: 'Global', desc: '全局匹配' },
                { key: 'i' as const, label: 'Ignore Case', desc: '忽略大小写' },
                { key: 'm' as const, label: 'Multiline', desc: '多行模式' }
              ].map(({ key, label, desc }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={flags[key]}
                    onChange={() => toggleFlag(key)}
                    className="w-4 h-4 accent-[var(--accent-color)]"
                  />
                  <span className="text-sm text-[var(--text-secondary)]">
                    <span className="font-mono font-bold">{key}</span>
                    <span className="ml-1 text-[var(--text-tertiary)]">- {desc}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* 测试文本 */}
          <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-3xl p-6 backdrop-blur-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">测试文本</h3>
              <button
                onClick={clearAll}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-[var(--glass-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm"
              >
                <Trash2 size={16} />
                清空
              </button>
            </div>
            <textarea
              value={testString}
              onChange={(e) => setTestString(e.target.value)}
              placeholder="在此输入要测试的文本..."
              className="w-full h-40 bg-[var(--glass-surface-hover)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-color)] transition-colors resize-none"
            />
          </div>

          {/* 常用模式 */}
          <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-3xl p-6 backdrop-blur-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Book size={20} className="text-[var(--accent-color)]" />
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">常用模式</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
              {commonPatterns.map((regex, index) => (
                <button
                  key={index}
                  onClick={() => loadPattern(regex)}
                  className="text-left p-3 rounded-xl bg-[var(--glass-surface-hover)] hover:bg-[var(--accent-color)] hover:text-black transition-colors group"
                >
                  <div className="font-medium text-sm mb-1 group-hover:font-semibold">{regex.name}</div>
                  <div className="text-xs opacity-70 line-clamp-1">{regex.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧：结果区域 */}
        <div className="space-y-6">
          {/* 匹配结果 */}
          <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-3xl p-6 backdrop-blur-2xl">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">匹配结果</h3>

            {error && (
              <div className="flex items-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 mb-4">
                <XCircle size={18} />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {matches.length > 0 && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 mb-4">
                <CheckCircle2 size={18} />
                <span className="text-sm">找到 {matches.length} 个匹配</span>
              </div>
            )}

            <div
              className="min-h-[200px] p-4 rounded-xl bg-[var(--glass-surface-hover)] border border-[var(--glass-border)] whitespace-pre-wrap break-words text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: highlightedText || '<span class="text-[var(--text-tertiary)]">匹配结果将在此处高亮显示</span>' }}
            />
          </div>

          {/* 匹配详情 */}
          {matches.length > 0 && (
            <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-3xl p-6 backdrop-blur-2xl">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">匹配详情</h3>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {matches.map((match, index) => (
                  <div key={index} className="p-4 rounded-xl bg-[var(--glass-surface-hover)] border border-[var(--glass-border)]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-[var(--accent-color)] uppercase">匹配 #{index + 1}</span>
                      <span className="text-xs text-[var(--text-tertiary)]">位置: {match.index}</span>
                    </div>
                    <code className="text-sm text-[var(--text-primary)] break-all block">{match.match}</code>
                    {match.groups.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <div className="text-xs text-[var(--text-tertiary)] uppercase">捕获组:</div>
                        {match.groups.map((group, groupIndex) => (
                          <div key={groupIndex} className="text-xs">
                            <span className="text-[var(--accent-color)]">${groupIndex + 1}:</span>{' '}
                            <code className="text-[var(--text-secondary)]">{group || '(空)'}</code>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegexTester;
