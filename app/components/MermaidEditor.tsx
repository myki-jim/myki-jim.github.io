'use client';

import React, { useState, useEffect } from 'react';
import mermaid from 'mermaid';
import {
  Copy,
  Download,
  RefreshCw,
  Eye,
  EyeOff,
  FileCode,
  Image,
  FileText,
  GitBranch,
  Share2,
  Calendar,
  Box,
  Database,
  Timer,
  GitMerge,
  Workflow,
  GitPullRequest,
  Layers,
  AlertCircle,
  Code,
  FileJson
} from 'lucide-react';

type MermaidTheme = 'default' | 'dark' | 'forest' | 'neutral' | 'base';

interface SampleDiagram {
  name: string;
  icon: React.ReactNode;
  code: string;
  description: string;
}

const MermaidEditor: React.FC = () => {
  const [code, setCode] = useState('');
  const [svgContent, setSvgContent] = useState('');
  const [error, setError] = useState('');
  const [theme, setTheme] = useState<MermaidTheme>('default');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [copied, setCopied] = useState(false);

  // Sample diagrams with icons
  const sampleDiagrams: SampleDiagram[] = [
    {
      name: '流程图',
      icon: <Workflow size={20} />,
      code: `graph TD
    A[开始] --> B{正常工作?}
    B -->|是| C[很好!]
    B -->|否| D[调试]
    D --> B`,
      description: '基础流程图示例'
    },
    {
      name: '时序图',
      icon: <GitPullRequest size={20} />,
      code: `sequenceDiagram
    participant 用户
    participant 前端
    participant 后端
    participant 数据库

    用户->>前端: 点击按钮
    前端->>后端: API 请求
    后端->>数据库: 查询数据
    数据库-->>后端: 返回数据
    后端-->>前端: JSON 响应
    前端-->>用户: 显示结果`,
      description: '用户认证流程'
    },
    {
      name: '甘特图',
      icon: <Calendar size={20} />,
      code: `gantt
    title 项目时间线
    dateFormat  YYYY-MM-DD
    section 阶段 1
    需求调研           :a1, 2024-01-01, 30d
    设计阶段             :a2, after a1, 20d
    section 阶段 2
    开发阶段        :a3, after a2, 40d
    测试阶段            :a4, after a3, 15d
    section 阶段 3
    部署上线         :a5, after a4, 10d`,
      description: '项目管理时间线'
    },
    {
      name: '类图',
      icon: <Layers size={20} />,
      code: `classDiagram
    class 动物 {
        +字符串 名称
        +整数 年龄
        +发出声音()
    }
    class 狗 {
        +字符串 品种
        +吠叫()
    }
    class 猫 {
        +字符串 颜色
        +喵叫()
    }
    动物 <|-- 狗
    动物 <|-- 猫`,
      description: '面向对象设计'
    },
    {
      name: '状态图',
      icon: <Share2 size={20} />,
      code: `stateDiagram-v2
    [*] --> 静止
    静止 --> [*]: 移动
    静止 --> 移动: 移动
    移动 --> 静止: 停止`,
      description: '状态转换'
    },
    {
      name: 'ER图',
      icon: <Database size={20} />,
      code: `erDiagram
    客户 ||--o{ 订单 : 下单
    订单 ||--|{ 订单项 : 包含
    客户 {
        字符串 姓名
        字符串 邮箱
        字符串 电话
    }
    订单 {
        整数 订单号
        日期 下单日期
        字符串 状态
    }
    订单项 {
        字符串 产品编码
        整数 数量
        浮点数 价格
    }`,
      description: '数据库关系'
    },
    {
      name: '用户旅程',
      icon: <Timer size={20} />,
      code: `journey
    title 客户旅程
    section 发现阶段
      浏览网站: 5: 用户
      比较选择: 3: 用户
    section 购买阶段
      加入购物车: 2: 用户
      完成结账: 5: 用户
    section 支持阶段
      联系客服: 3: 用户
      解决问题: 4: 用户`,
      description: '用户体验映射'
    },
    {
      name: 'Git图',
      icon: <GitBranch size={20} />,
      code: `gitGraph
    commit
    branch develop
    checkout develop
    commit
    commit
    checkout main
    merge develop
    commit
    branch feature
    checkout feature
    commit
    checkout main
    merge feature
    commit`,
      description: 'Git分支策略'
    },
    {
      name: '思维导图',
      icon: <GitMerge size={20} />,
      code: `mindmap
  root((思维导图))
    起源
      悠久历史
      ::icon(fa fa-book)
      普及
        英国大众心理学作家 托尼·布赞
    研究
      关于有效性
      和特性
    应用
      创意技巧
      战略规划
      论证映射`,
      description: '思维导图结构'
    },
    {
      name: '饼图',
      icon: <Box size={20} />,
      code: `pie title 志愿者领养的宠物
    "狗" : 386
    "猫" : 85
    "仓鼠" : 15`,
      description: '数据可视化'
    }
  ];

  // Initialize Mermaid
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: theme,
      securityLevel: 'loose',
      fontFamily: 'monospace',
      fontSize: 14,
    });
  }, [theme]);

  // Render diagram when code or theme changes
  useEffect(() => {
    if (code.trim()) {
      renderDiagram();
    } else {
      setSvgContent('');
      setError('');
    }
  }, [code, theme]);

  const renderDiagram = async () => {
    try {
      const id = `mermaid-${Date.now()}`;
      const { svg } = await mermaid.render(id, code);
      setSvgContent(svg);
      setError('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      setError(`渲染错误: ${errorMessage}`);
      setSvgContent('');
    }
  };

  const loadSample = (sample: SampleDiagram) => {
    setCode(sample.code);
    setIsPreviewMode(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadSVG = () => {
    if (!svgContent) return;

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mermaid-diagram-${Date.now()}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadCode = () => {
    if (!code.trim()) return;

    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mermaid-diagram-${Date.now()}.mmd`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setCode('');
    setSvgContent('');
    setError('');
  };

  const themes: { value: MermaidTheme; label: string }[] = [
    { value: 'default', label: '默认' },
    { value: 'base', label: '基础' },
    { value: 'dark', label: '暗色' },
    { value: 'forest', label: '森林' },
    { value: 'neutral', label: '中性' }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-3">Mermaid 图表编辑器</h2>
        <p className="text-[var(--text-secondary)]">创建流程图、序列图、甘特图等多种图表，支持实时预览</p>
      </div>

      <div className="space-y-6">
        {/* Controls */}
        <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-3xl p-6 backdrop-blur-2xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Theme Selection */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-[var(--text-primary)]">主题:</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as MermaidTheme)}
                className="px-4 py-2 rounded-xl bg-[var(--glass-surface-hover)] border border-[var(--glass-border)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-color)] transition-colors"
              >
                {themes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--glass-surface-hover)] hover:bg-[var(--accent-color)] hover:text-black text-[var(--text-secondary)] transition-colors"
              >
                {isPreviewMode ? <EyeOff size={16} /> : <Eye size={16} />}
                {isPreviewMode ? '编辑模式' : '预览模式'}
              </button>

              <button
                onClick={clearAll}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--glass-surface-hover)] hover:bg-[var(--accent-color)] hover:text-black text-[var(--text-secondary)] transition-colors"
              >
                <RefreshCw size={16} />
                清空
              </button>

              <button
                onClick={() => copyToClipboard(code)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--glass-surface-hover)] hover:bg-[var(--accent-color)] hover:text-black text-[var(--text-secondary)] transition-colors"
              >
                {copied ? <Copy size={16} /> : <Copy size={16} />}
                {copied ? '已复制' : '复制代码'}
              </button>

              <button
                onClick={downloadCode}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--glass-surface-hover)] hover:bg-[var(--accent-color)] hover:text-black text-[var(--text-secondary)] transition-colors"
              >
                <FileCode size={16} />
                保存代码
              </button>

              <button
                onClick={downloadSVG}
                disabled={!svgContent}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--glass-surface-hover)] hover:bg-[var(--accent-color)] hover:text-black text-[var(--text-secondary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Image size={16} />
                导出 SVG
              </button>
            </div>
          </div>
        </div>

        {/* Sample Diagrams */}
        <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-3xl p-6 backdrop-blur-2xl">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2 mb-4">
            <FileText size={18} className="text-[var(--accent-color)]" />
            示例图表
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {sampleDiagrams.map((sample, index) => (
              <button
                key={index}
                onClick={() => loadSample(sample)}
                className="p-4 rounded-xl bg-[var(--glass-surface-hover)] hover:bg-[var(--accent-color)] hover:text-black text-[var(--text-secondary)] transition-all text-left"
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="text-[var(--accent-color)]">{sample.icon}</div>
                  <div className="text-sm font-bold text-center">{sample.name}</div>
                  <div className="text-xs text-center opacity-75">{sample.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Editor and Preview */}
        <div className={`grid gap-6 ${isPreviewMode ? 'grid-cols-1' : 'lg:grid-cols-2'}`}>
          {/* Code Editor */}
          {!isPreviewMode && (
            <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-3xl p-6 backdrop-blur-2xl">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2 mb-4">
                <Code size={18} className="text-[var(--accent-color)]" />
                Mermaid 代码
              </h3>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="在此输入 Mermaid 图表代码..."
                className="w-full h-96 bg-[var(--glass-surface-hover)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-color)] transition-colors resize-none font-mono text-sm"
              />
              <div className="flex gap-4 mt-3 text-xs text-[var(--text-tertiary)]">
                <span>行数: {code.split('\n').length}</span>
                <span>字符数: {code.length.toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Preview */}
          <div className={`bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-3xl p-6 backdrop-blur-2xl ${isPreviewMode ? 'col-span-1' : ''}`}>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2 mb-4">
              <Image size={18} className="text-[var(--accent-color)]" />
              预览
            </h3>
            <div className="min-h-[400px] bg-[var(--glass-surface-hover)] border border-[var(--glass-border)] rounded-xl p-4 overflow-auto">
              {error ? (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                  <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-400 mb-2">渲染错误</p>
                    <pre className="text-xs text-red-300/80 whitespace-pre-wrap font-mono">{error}</pre>
                  </div>
                </div>
              ) : svgContent ? (
                <div
                  className="flex items-center justify-center"
                  dangerouslySetInnerHTML={{ __html: svgContent }}
                />
              ) : (
                <div className="flex items-center justify-center h-full min-h-[350px]">
                  <div className="text-center">
                    <Image size={48} className="mx-auto text-[var(--text-tertiary)] mb-3" />
                    <p className="text-[var(--text-tertiary)]">图表预览将在此显示</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Reference */}
        <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-3xl p-6 backdrop-blur-2xl">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2 mb-4">
            <FileJson size={18} className="text-[var(--accent-color)]" />
            快速参考
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Basic Syntax */}
            <div className="p-4 rounded-xl bg-[var(--glass-surface-hover)] border border-[var(--glass-border)]">
              <h4 className="font-bold text-sm text-[var(--text-primary)] mb-3">基础语法</h4>
              <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
                <li><code className="bg-[var(--glass-surface)] px-2 py-0.5 rounded">graph TD</code> - 从上到下</li>
                <li><code className="bg-[var(--glass-surface)] px-2 py-0.5 rounded">graph LR</code> - 从左到右</li>
                <li><code className="bg-[var(--glass-surface)] px-2 py-0.5 rounded">A --> B</code> - 箭头</li>
                <li><code className="bg-[var(--glass-surface)] px-2 py-0.5 rounded">A -- "文本" --> B</code> - 带文字</li>
              </ul>
            </div>

            {/* Shapes */}
            <div className="p-4 rounded-xl bg-[var(--glass-surface-hover)] border border-[var(--glass-border)]">
              <h4 className="font-bold text-sm text-[var(--text-primary)] mb-3">形状</h4>
              <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
                <li><code className="bg-[var(--glass-surface)] px-2 py-0.5 rounded">A["文本"]</code> - 矩形</li>
                <li><code className="bg-[var(--glass-surface)] px-2 py-0.5 rounded">A("文本")</code> - 圆角</li>
                <li><code className="bg-[var(--glass-surface)] px-2 py-0.5 rounded">A{"文本"}</code> - 菱形</li>
                <li><code className="bg-[var(--glass-surface)] px-2 py-0.5 rounded">A(("文本"))</code> - 圆形</li>
              </ul>
            </div>

            {/* Links */}
            <div className="p-4 rounded-xl bg-[var(--glass-surface-hover)] border border-[var(--glass-border)]">
              <h4 className="font-bold text-sm text-[var(--text-primary)] mb-3">连接线</h4>
              <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
                <li><code className="bg-[var(--glass-surface)] px-2 py-0.5 rounded">A --> B</code> - 实线箭头</li>
                <li><code className="bg-[var(--glass-surface)] px-2 py-0.5 rounded">A --- B</code> - 实线</li>
                <li><code className="bg-[var(--glass-surface)] px-2 py-0.5 rounded">A -.-> B</code> - 虚线</li>
                <li><code className="bg-[var(--glass-surface)] px-2 py-0.5 rounded">A ==> B</code> - 粗线</li>
              </ul>
            </div>

            {/* Subgraphs */}
            <div className="p-4 rounded-xl bg-[var(--glass-surface-hover)] border border-[var(--glass-border)]">
              <h4 className="font-bold text-sm text-[var(--text-primary)] mb-3">子图</h4>
              <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
                <li><code className="bg-[var(--glass-surface)] px-2 py-0.5 rounded">subgraph 标题</code></li>
                <li><code className="bg-[var(--glass-surface)] px-2 py-0.5 rounded">  A --> B</code></li>
                <li><code className="bg-[var(--glass-surface)] px-2 py-0.5 rounded">end</code></li>
              </ul>
            </div>
          </div>

          {/* Supported Diagram Types */}
          <div className="mt-4 p-4 rounded-xl bg-[var(--glass-surface-hover)] border border-[var(--glass-border)]">
            <h4 className="font-bold text-sm text-[var(--text-primary)] mb-3">支持的图表类型</h4>
            <div className="flex flex-wrap gap-2">
              {['流程图', '时序图', '甘特图', '类图', '状态图', 'ER图', '用户旅程', 'Git图', '思维导图', '饼图', '用例图', '需求图', 'C4架构图'].map((type) => (
                <span
                  key={type}
                  className="px-3 py-1 rounded-lg bg-[var(--glass-surface)] text-xs text-[var(--text-secondary)]"
                >
                  {type}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Documentation Link */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-3xl p-6">
          <div className="flex items-start gap-3">
            <FileText size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-400 mb-2">需要更多帮助？</h4>
              <p className="text-sm text-blue-300/80">
                访问{' '}
                <a
                  href="https://mermaid.js.org/intro/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-blue-300 transition-colors"
                >
                  Mermaid 官方文档
                </a>
                {' '}查看完整的语法指南和更多示例。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MermaidEditor;
