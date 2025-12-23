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
  example?: string;
}

const RegexTester: React.FC = () => {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState({ g: true, i: false, m: false });
  const [testString, setTestString] = useState('');
  const [matches, setMatches] = useState<RegexMatch[]>([]);
  const [error, setError] = useState('');
  const [highlightedText, setHighlightedText] = useState('');

  // 常用正则表达式模式（中文）
  const commonPatterns: CommonPattern[] = [
    // 基础匹配
    { name: '电子邮箱', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', description: '匹配常见邮箱地址', example: 'user@example.com, admin@test.co.cn' },
    { name: '手机号码（中国）', pattern: '1[3-9]\\d{9}', description: '匹配中国大陆手机号', example: '13812345678, 15987654321' },
    { name: '固定电话（中国）', pattern: '0\\d{2,3}-?\\d{7,8}', description: '匹配中国固定电话', example: '010-12345678, 021-87654321' },
    { name: '身份证号', pattern: '[1-9]\\d{5}(18|19|20)\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])\\d{3}[\\dXx]', description: '匹配18位身份证号', example: '110101199001011234' },
    { name: '邮政编码', pattern: '\\d{6}', description: '匹配6位邮政编码', example: '100000, 200000' },

    // 网络相关
    { name: 'HTTP URL', pattern: 'https?:\\/\\/[\\w\\-]+(\\.[\\w\\-]+)+([\\w\\-.,@?^=%&:/~+#]*[\\w\\-@?^=%&/~+#])?', description: '匹配HTTP/HTTPS网址', example: 'https://www.example.com, http://test.org' },
    { name: 'IPv4 地址', pattern: '\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b', description: '匹配有效的IPv4地址', example: '192.168.1.1, 10.0.0.1' },
    { name: 'MAC 地址', pattern: '([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})', description: '匹配MAC地址', example: '00:1A:2B:3C:4D:5E' },

    // 日期时间
    { name: '日期 (YYYY-MM-DD)', pattern: '\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])', description: '匹配标准日期格式', example: '2024-01-15, 2023-12-31' },
    { name: '时间 (HH:MM:SS)', pattern: '([01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d', description: '匹配24小时制时间', example: '14:30:45, 09:15:30' },
    { name: '日期时间', pattern: '\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])\\s+([01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d', description: '匹配日期和时间', example: '2024-01-15 14:30:45' },

    // 颜色代码
    { name: '十六进制颜色', pattern: '#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})\\b', description: '匹配CSS颜色代码', example: '#FF5733, #333, #f00' },
    { name: 'RGB 颜色', pattern: 'rgb\\(\\s*\\d{1,3}%?\\s*,\\s*\\d{1,3}%?\\s*,\\s*\\d{1,3}%?\\s*\\)', description: '匹配RGB颜色值', example: 'rgb(255, 0, 0), rgb(100, 150, 200)' },

    // 数字货币
    { name: '金额（人民币）', pattern: '¥\\s?\\d{1,3}(,\\d{3})*(\\.\\d{2})?', description: '匹配人民币金额', example: '¥1,234.56, ¥100' },
    { name: '金额（美元）', pattern: '\\$\\s?\\d{1,3}(,\\d{3})*(\\.\\d{2})?', description: '匹配美元金额', example: '$1,234.56, $100' },
    { name: '百分比', pattern: '\\d+(\\.\\d+)?%', description: '匹配百分比', example: '25%, 87.5%' },

    // 代码相关
    { name: 'HTML 标签', pattern: '<\\/?[a-zA-Z][a-zA-Z0-9]*(?:\\s[^<>]*)?\\/?>', description: '匹配HTML标签', example: '<div>, <img src="test.jpg" />, </span>' },
    { name: 'JSON 键', pattern: '"([^"\\\\]|\\\\.)*"\\s*:', description: '匹配JSON对象的键', example: '"name": "value", "age": 30' },
    { name: '整数', pattern: '-?\\b\\d+\\b', description: '匹配整数（含负数）', example: '123, -456' },
    { name: '小数', pattern: '-?\\b\\d+\\.\\d+\\b', description: '匹配小数', example: '3.14, -2.5' },

    // 文件相关
    { name: '文件扩展名', pattern: '\\.[a-zA-Z0-9]{2,8}$', description: '匹配文件扩展名', example: '.txt, .jpg, .png' },
    { name: 'Windows 路径', pattern: '[A-Z]:\\\\(?:[^\\\\:\\/\\*\\?"<>|\\r\\n]+\\\\)*[^\\\\:\\/\\*\\?"<>|\\r\\n]*', description: '匹配Windows文件路径', example: 'C:\\Users\\test\\file.txt' },
    { name: 'Unix 路径', pattern: '/(?:[^/\\0]+/)*[^/\\0]+', description: '匹配Unix/Linux路径', example: '/home/user/docs/file.txt' },

    // 社交媒体
    { name: '微信公众号', pattern: '[a-zA-Z0-9_-]{4,20}', description: '匹配微信号格式', example: 'wechat_id_123' },
    { name: '微博账号', pattern: '@[a-zA-Z0-9_\\u4e00-\\u9fa5]{1,20}', description: '匹配微博@用户', example: '@用户名' },
    { name: '话题标签', pattern: '#[\\w\\u4e00-\\u9fa5]+', description: '匹配话题标签', example: '#JavaScript, #前端开发' },

    // 通用
    { name: '用户名', pattern: '[a-zA-Z0-9_]{3,16}', description: '匹配3-16位用户名', example: 'user_123, test_account' },
    { name: '强密码', pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$', description: '匹配强密码（大小写+数字+特殊字符）', example: 'MyP@ssw0rd' },
    { name: '车牌号（普通）', pattern: '[\\u4e00-\\u9fa5][A-Z][A-Z0-9]{5}', description: '匹配普通车牌号', example: '京A12345, 沪B12345' },
    { name: 'QQ 号码', pattern: '[1-9][0-9]{4,10}', description: '匹配QQ号', example: '123456789' },

    // 编码
    { name: 'Base64 字符串', pattern: '(?:[A-Za-z0-9+\\/]{4})*(?:[A-Za-z0-9+\\/]{2}==|[A-Za-z0-9+\\/]{3}=)?', description: '匹配Base64编码', example: 'SGVsbG8gV29ybGQ=' },
    { name: 'UUID/GUID', pattern: '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}', description: '匹配UUID格式', example: '550e8400-e29b-41d4-a716-446655440000' },

    // 版本号
    { name: '语义化版本', pattern: '\\b\\d+\\.\\d+\\.\\d+(?:-[a-zA-Z0-9.-]+)?\\b', description: '匹配语义化版本号', example: '1.2.3, 2.0.0-beta' },

    // 中文相关
    { name: '中文字符', pattern: '[\\u4e00-\\u9fa5]', description: '匹配中文字符', example: '你好世界' },
    { name: '中英文数字混合', pattern: '[a-zA-Z0-9\\u4e00-\\u9fa5]+', description: '匹配中英文和数字', example: '测试Test123' },
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
    const exampleText = regexPattern.example || `${regexPattern.description}\n\n在此处输入测试文本...`;
    setTestString(exampleText);
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

          {/* 快速参考 */}
          <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-3xl p-6 backdrop-blur-2xl">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">快速参考</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-[var(--accent-color)] mb-2">字符类</h4>
                <div className="space-y-1 text-[var(--text-secondary)]">
                  <div><code>.</code> 任意字符</div>
                  <div><code>\d</code> 数字 (0-9)</div>
                  <div><code>\w</code> 字母数字下划线</div>
                  <div><code>\s</code> 空白字符</div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-[var(--accent-color)] mb-2">量词</h4>
                <div className="space-y-1 text-[var(--text-secondary)]">
                  <div><code>*</code> 0次或多次</div>
                  <div><code>+</code> 1次或多次</div>
                  <div><code>?</code> 0次或1次</div>
                  <div><code>{'{n,m}'}</code> n到m次</div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-[var(--accent-color)] mb-2">锚点</h4>
                <div className="space-y-1 text-[var(--text-secondary)]">
                  <div><code>^</code> 字符串开头</div>
                  <div><code>$</code> 字符串结尾</div>
                  <div><code>\b</code> 单词边界</div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-[var(--accent-color)] mb-2">分组</h4>
                <div className="space-y-1 text-[var(--text-secondary)]">
                  <div><code>()</code> 捕获组</div>
                  <div><code>(?:)</code> 非捕获组</div>
                  <div><code>[]</code> 字符集</div>
                  <div><code>|</code> 或运算</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegexTester;
