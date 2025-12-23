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
      name: 'Flowchart',
      icon: <Workflow size={20} />,
      code: `graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> B`,
      description: 'Basic flowchart example'
    },
    {
      name: 'Sequence',
      icon: <GitPullRequest size={20} />,
      code: `sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Database

    User->>Frontend: Click button
    Frontend->>Backend: API request
    Backend->>Database: Query data
    Database-->>Backend: Return data
    Backend-->>Frontend: JSON response
    Frontend-->>User: Display results`,
      description: 'User authentication flow'
    },
    {
      name: 'Gantt',
      icon: <Calendar size={20} />,
      code: `gantt
    title Project Timeline
    dateFormat  YYYY-MM-DD
    section Phase 1
    Research           :a1, 2024-01-01, 30d
    Design             :a2, after a1, 20d
    section Phase 2
    Development        :a3, after a2, 40d
    Testing            :a4, after a3, 15d
    section Phase 3
    Deployment         :a5, after a4, 10d`,
      description: 'Project management timeline'
    },
    {
      name: 'Class Diagram',
      icon: <Layers size={20} />,
      code: `classDiagram
    class Animal {
        +String name
        +int age
        +makeSound()
    }
    class Dog {
        +String breed
        +bark()
    }
    class Cat {
        +String color
        +meow()
    }
    Animal <|-- Dog
    Animal <|-- Cat`,
      description: 'Object-oriented design'
    },
    {
      name: 'State Diagram',
      icon: <Share2 size={20} />,
      code: `stateDiagram-v2
    [*] --> Still
    Still --> [*]: Moving
    Still --> Moving: Move
    Moving --> Still: Stop`,
      description: 'State transitions'
    },
    {
      name: 'ER Diagram',
      icon: <Database size={20} />,
      code: `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    CUSTOMER {
        string name
        string email
        string phone
    }
    ORDER {
        int orderNumber
        date orderDate
        string status
    }
    LINE-ITEM {
        string productCode
        int quantity
        float price
    }`,
      description: 'Database relationships'
    },
    {
      name: 'Journey',
      icon: <Timer size={20} />,
      code: `journey
    title Customer Journey
    section Discovery
      Research websites: 5: User
      Compare options: 3: User
    section Purchase
      Add to cart: 2: User
      Complete checkout: 5: User
    section Support
      Contact support: 3: User
      Resolve issue: 4: User`,
      description: 'User experience mapping'
    },
    {
      name: 'Git Graph',
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
      description: 'Git branching strategy'
    },
    {
      name: 'Mindmap',
      icon: <GitMerge size={20} />,
      code: `mindmap
  root((Mindmap))
    Origins
      Long history
      ::icon(fa fa-book)
      Popularisation
        British popular psychology author Tony Buzan
    Research
      On effectiveness
      and features
    On usage
      Creative techniques
      Strategic planning
      Argument mapping`,
      description: 'Mind mapping structure'
    },
    {
      name: 'Pie Chart',
      icon: <Box size={20} />,
      code: `pie title Pets adopted by volunteers
    "Dogs" : 386
    "Cats" : 85
    "Rats" : 15`,
      description: 'Data visualization'
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
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Rendering error: ${errorMessage}`);
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
    { value: 'default', label: 'Default' },
    { value: 'base', label: 'Base' },
    { value: 'dark', label: 'Dark' },
    { value: 'forest', label: 'Forest' },
    { value: 'neutral', label: 'Neutral' }
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
              {['Flowchart', 'Sequence', 'Gantt', 'Class', 'State', 'ER', 'Journey', 'Git', 'Mindmap', 'Pie', 'User Journey', 'Requirement', 'C4'].map((type) => (
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
