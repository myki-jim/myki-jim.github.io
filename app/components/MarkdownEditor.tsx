'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  Link,
  Image,
  Code,
  List,
  ListOrdered,
  Quote,
  Strikethrough,
  Copy,
  Download,
  Upload,
  Maximize2,
  Minimize2,
  FileText,
  Eye,
  EyeOff,
  Check,
  Trash2,
  FileDown,
  FileCode,
  FilePlus,
  FolderOpen,
  Save,
  X,
  MoreHorizontal,
  Keyboard,
  ChevronRight,
  Files
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { AnimatePresence, motion } from 'framer-motion';

interface MarkdownFile {
  id: string;
  name: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

const MarkdownEditor: React.FC = () => {
  const [files, setFiles] = useState<MarkdownFile[]>([]);
  const [currentFileId, setCurrentFileId] = useState<string | null>(null);
  const [markdown, setMarkdown] = useState('');
  const [copied, setCopied] = useState(false);
  const [htmlCopied, setHtmlCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [lineCount, setLineCount] = useState(0);
  const [showFileList, setShowFileList] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [isSwitchingFile, setIsSwitchingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 初始化：从 localStorage 加载文件
  useEffect(() => {
    const savedFiles = localStorage.getItem('markdown-files');
    if (savedFiles) {
      const parsedFiles = JSON.parse(savedFiles) as MarkdownFile[];
      setFiles(parsedFiles);
      if (parsedFiles.length > 0) {
        const lastFileId = localStorage.getItem('markdown-last-file');
        const fileToOpen = lastFileId
          ? parsedFiles.find(f => f.id === lastFileId)
          : parsedFiles[0];
        if (fileToOpen) {
          setCurrentFileId(fileToOpen.id);
          setMarkdown(fileToOpen.content);
        }
      }
    } else {
      // 创建默认文件
      createNewFile();
    }
  }, []);

  // 自动保存
  useEffect(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    autoSaveTimerRef.current = setTimeout(() => {
      saveCurrentFile();
    }, 1000);
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [markdown]);

  // 统计信息
  useEffect(() => {
    updateStats(markdown);
  }, [markdown]);

  const currentFile = files.find(f => f.id === currentFileId);

  const updateStats = (text: string) => {
    const lines = text.split('\n').length;
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    setLineCount(lines);
    setCharCount(chars);
    setWordCount(words);
  };

  const saveFilesToStorage = (updatedFiles: MarkdownFile[]) => {
    localStorage.setItem('markdown-files', JSON.stringify(updatedFiles));
  };

  const saveCurrentFile = () => {
    if (!currentFileId) return;
    const updatedFiles = files.map(f =>
      f.id === currentFileId
        ? { ...f, content: markdown, updatedAt: Date.now() }
        : f
    );
    setFiles(updatedFiles);
    saveFilesToStorage(updatedFiles);
  };

  const createNewFile = () => {
    const newFile: MarkdownFile = {
      id: `file-${Date.now()}`,
      name: `未命名文档 ${files.length + 1}`,
      content: '',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    const updatedFiles = [...files, newFile];
    setFiles(updatedFiles);
    saveFilesToStorage(updatedFiles);
    setCurrentFileId(newFile.id);
    setMarkdown('');
    localStorage.setItem('markdown-last-file', newFile.id);
  };

  const deleteFile = (fileId: string) => {
    if (files.length === 1) {
      alert('至少需要保留一个文件');
      return;
    }
    if (!confirm('确定要删除这个文件吗？')) return;

    const updatedFiles = files.filter(f => f.id !== fileId);
    setFiles(updatedFiles);
    saveFilesToStorage(updatedFiles);

    if (currentFileId === fileId) {
      const nextFile = updatedFiles[0];
      setCurrentFileId(nextFile.id);
      setMarkdown(nextFile.content);
      localStorage.setItem('markdown-last-file', nextFile.id);
    }
  };

  const switchFile = (fileId: string) => {
    if (fileId === currentFileId) {
      setShowFileList(false);
      return;
    }

    setIsSwitchingFile(true);
    saveCurrentFile();

    setTimeout(() => {
      const file = files.find(f => f.id === fileId);
      if (file) {
        setCurrentFileId(fileId);
        setMarkdown(file.content);
        localStorage.setItem('markdown-last-file', fileId);
      }

      setTimeout(() => {
        setIsSwitchingFile(false);
        setShowFileList(false);
      }, 150);
    }, 150);
  };

  const renameFile = (fileId: string, newName: string) => {
    const updatedFiles = files.map(f =>
      f.id === fileId ? { ...f, name: newName } : f
    );
    setFiles(updatedFiles);
    saveFilesToStorage(updatedFiles);
  };

  // 改进的 insertText，支持多行操作
  const insertText = (before: string, after: string = '', placeholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = markdown.substring(start, end) || placeholder;

    // 获取当前行信息
    const textBefore = markdown.substring(0, start);
    const textAfter = markdown.substring(end);
    const linesBefore = textBefore.split('\n');
    const linesAfter = textAfter.split('\n');
    const currentLineStart = textBefore.lastIndexOf('\n') + 1;
    const currentLineEnd = end + textAfter.indexOf('\n');

    // 如果有选中多行文本
    const fullSelectedText = markdown.substring(start, end);
    const hasMultipleLines = fullSelectedText.includes('\n');

    let newText = '';
    if (hasMultipleLines) {
      // 多行处理：每一行都添加前缀
      const selectedLines = fullSelectedText.split('\n');
      const processedLines = selectedLines.map(line => {
        // 如果是要移除列表格式
        if (before === '-remove-') {
          return line.replace(/^(\s*)([-*+]|\d+\.)\s+/, '$1');
        }
        // 检查是否已经有列表标记
        if (before.match(/^[*-]\s/) && line.match(/^\s*[-*+]\s/)) {
          return line; // 已经有无序列表标记
        }
        if (before.match(/^\d+\.\s/) && line.match(/^\s*\d+\.\s/)) {
          return line; // 已经有序列表标记
        }
        return before + line;
      });
      newText = markdown.substring(0, start) + processedLines.join('\n') + markdown.substring(end);
    } else {
      // 单行处理
      newText = markdown.substring(0, start) + before + selectedText + after + markdown.substring(end);
    }

    setMarkdown(newText);

    setTimeout(() => {
      textarea.focus();
      const newPosition = start + (hasMultipleLines ? newText.length - markdown.length : before.length + selectedText.length);
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  // 移除列表格式
  const removeList = () => {
    insertText('-remove-', '', '');
  };

  const insertHeading = (level: number) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const textBefore = markdown.substring(0, start);
    const lineStart = textBefore.lastIndexOf('\n') + 1;
    const line = markdown.substring(lineStart, start + markdown.substring(start).indexOf('\n') + 1 || markdown.length);

    // 检查当前行是否已经有标题
    const headingMatch = line.match(/^(#{1,6})\s/);
    if (headingMatch) {
      // 移除现有标题
      const newLine = line.replace(/^#{1,6}\s/, '');
      setMarkdown(markdown.substring(0, lineStart) + newLine + markdown.substring(lineStart + line.length));
    } else {
      // 添加标题
      const prefix = '#'.repeat(level) + ' ';
      insertText(prefix, '', '标题文本');
    }
  };

  const insertLink = () => {
    insertText('[', '](https://)', '链接文本');
  };

  const insertImage = () => {
    insertText('![', '](https://)', '图片描述');
  };

  const insertCode = () => {
    insertText('`', '`', '代码');
  };

  const insertCodeBlock = () => {
    insertText('\n```\n', '\n```\n', '代码块');
  };

  // 键盘快捷键处理
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modKey = isMac ? e.metaKey : e.ctrlKey;
    const shiftKey = e.shiftKey;

    // 浏览器原生支持的快捷键，不需要阻止默认行为
    const nativeShortcuts = ['a', 'c', 'v', 'x', 'z', 'y'];

    if (modKey && nativeShortcuts.includes(e.key.toLowerCase())) {
      // Ctrl/Cmd + A: 全选 (浏览器原生)
      // Ctrl/Cmd + C: 复制 (浏览器原生)
      // Ctrl/Cmd + V: 粘贴 (浏览器原生)
      // Ctrl/Cmd + X: 剪切 (浏览器原生)
      // Ctrl/Cmd + Z: 撤销 (浏览器原生)
      // Ctrl/Cmd + Y: 重做 (浏览器原生)
      // Ctrl/Cmd + Shift + Z: 重做 (浏览器原生)
      return;
    }

    if (!modKey) return;

    // 以下是需要自定义处理的快捷键
    e.preventDefault();

    switch (e.key.toLowerCase()) {
      case 'b':
        insertText('**', '**', '粗体文本');
        break;
      case 'i':
        insertText('*', '*', '斜体文本');
        break;
      case 'k':
        insertLink();
        break;
      case 's':
        saveCurrentFile();
        break;
      case '1':
        insertHeading(1);
        break;
      case '2':
        insertHeading(2);
        break;
      case '3':
        insertHeading(3);
        break;
      case '/':
        setShowKeyboardShortcuts(!showKeyboardShortcuts);
        break;
      case 'd':
        // 选中当前行
        const textarea = textareaRef.current;
        if (textarea) {
          const start = textarea.selectionStart;
          const textBefore = markdown.substring(0, start);
          const lineStart = textBefore.lastIndexOf('\n') + 1;
          const textAfter = markdown.substring(start);
          const lineEnd = start + textAfter.indexOf('\n');
          const endLine = lineEnd === start - 1 ? markdown.length : lineEnd;
          textarea.setSelectionRange(lineStart, endLine);
        }
        break;
    }
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyHTML = () => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = previewRef.current?.innerHTML || '';
    navigator.clipboard.writeText(tempDiv.innerHTML);
    setHtmlCopied(true);
    setTimeout(() => setHtmlCopied(false), 2000);
  };

  const handleExportMD = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentFile?.name || 'document'}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportHTML = () => {
    if (!previewRef.current) return;

    const fullHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${currentFile?.name || 'Markdown 导出文档'}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.8; color: #24292e; background: #ffffff; max-width: 900px; margin: 0 auto; padding: 40px 20px; }
        h1, h2, h3 { margin-top: 24px; margin-bottom: 16px; font-weight: 600; line-height: 1.25; }
        h1 { font-size: 2em; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
        h2 { font-size: 1.5em; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
        p { margin-bottom: 16px; }
        a { color: #0366d6; text-decoration: none; }
        code { padding: 0.2em 0.4em; background-color: rgba(27, 31, 35, 0.05); border-radius: 6px; }
        pre { padding: 16px; background-color: #f6f8fa; border-radius: 6px; margin-bottom: 16px; }
        blockquote { padding: 0 1em; color: #6a737d; border-left: 0.25em solid #dfe2e5; }
        ul, ol { padding-left: 2em; margin-bottom: 16px; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 16px; }
        table th, table td { padding: 6px 13px; border: 1px solid #dfe2e5; }
        img { max-width: 100%; }
    </style>
</head>
<body>
    ${previewRef.current.innerHTML}
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentFile?.name || 'document'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === 'text/markdown' || file.name.endsWith('.md'))) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const newFile: MarkdownFile = {
          id: `file-${Date.now()}`,
          name: file.name.replace('.md', ''),
          content,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        const updatedFiles = [...files, newFile];
        setFiles(updatedFiles);
        saveFilesToStorage(updatedFiles);
        setCurrentFileId(newFile.id);
        setMarkdown(content);
        localStorage.setItem('markdown-last-file', newFile.id);
      };
      reader.readAsText(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClear = () => {
    if (confirm('确定要清空当前文件内容吗？')) {
      setMarkdown('');
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <>
      {/* 使用 Portal 将文件列表渲染到 body 中，确保在最顶层 */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence mode="wait">
          {!showFileList ? (
            <motion.button
              key="file-toggle"
              initial={{ filter: 'blur(8px)', opacity: 0 }}
              animate={{ filter: 'blur(0px)', opacity: 1 }}
              exit={{ filter: 'blur(8px)', opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setShowFileList(true)}
              className="fixed bottom-6 left-6 z-[99999] p-4 rounded-2xl bg-[var(--glass-surface)] border border-[var(--glass-border)] backdrop-blur-2xl shadow-xl hover:shadow-2xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-shadow duration-300"
              title="文件列表"
            >
              <Files size={24} />
            </motion.button>
          ) : (
            <motion.div
              key="file-list"
              initial={{ filter: 'blur(8px)', opacity: 0 }}
              animate={{ filter: 'blur(0px)', opacity: 1 }}
              exit={{ filter: 'blur(8px)', opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed bottom-6 left-6 z-[99999] w-80 bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-3xl p-5 backdrop-blur-2xl shadow-2xl"
            >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <FolderOpen size={18} />
                文件列表 ({files.length})
              </h3>
              <button
                onClick={() => setShowFileList(false)}
                className="p-2 rounded-xl hover:bg-[var(--glass-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="space-y-2 max-h-[350px] overflow-y-auto custom-scrollbar pr-1">
              {files.map((file, index) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.04, duration: 0.2 }}
                  className={`group relative p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                    currentFileId === file.id
                      ? 'bg-[var(--accent-color)] text-black shadow-lg'
                      : 'bg-[var(--glass-surface-hover)] hover:bg-[var(--accent-color)]/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                  onClick={() => switchFile(file.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(file.updatedAt).toLocaleDateString('zh-CN')}
                      </p>
                    </div>
                    {files.length > 1 && currentFileId !== file.id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteFile(file.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/20 hover:text-red-400 transition-all"
                        title="删除文件"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-[var(--glass-border)]">
              <motion.button
                onClick={createNewFile}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-[var(--accent-color)] text-black hover:opacity-90 transition-opacity text-sm font-medium shadow-lg"
              >
                <FilePlus size={16} />
                新建文件
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>,
        document.body
      )}

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-3">Markdown 编辑器</h2>
        <p className="text-[var(--text-secondary)]">实时预览编辑器，支持 GitHub Flavored Markdown，自动保存到浏览器</p>
      </div>

      <div className="space-y-6">
        {/* 工具栏 */}
        <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-3xl p-4 backdrop-blur-2xl">
          <div className="flex flex-wrap items-center gap-2">
            {/* 文件操作 */}
            <div className="flex items-center gap-1 pr-3 border-r border-[var(--glass-border)]">
              <button
                onClick={saveCurrentFile}
                className="p-2 rounded-lg hover:bg-[var(--glass-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                title="保存文件 (Ctrl+S)"
              >
                <Save size={16} />
              </button>
            </div>

            {/* 文本格式 */}
            <div className="flex items-center gap-1 px-3 border-r border-[var(--glass-border)]">
              <button
                onClick={() => insertText('**', '**', '粗体文本')}
                className="p-2 rounded-lg hover:bg-[var(--glass-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                title="粗体 (Ctrl+B)"
              >
                <Bold size={16} />
              </button>
              <button
                onClick={() => insertText('*', '*', '斜体文本')}
                className="p-2 rounded-lg hover:bg-[var(--glass-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                title="斜体 (Ctrl+I)"
              >
                <Italic size={16} />
              </button>
              <button
                onClick={() => insertText('~~', '~~', '删除线文本')}
                className="p-2 rounded-lg hover:bg-[var(--glass-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                title="删除线"
              >
                <Strikethrough size={16} />
              </button>
            </div>

            {/* 标题 */}
            <div className="flex items-center gap-1 px-3 border-r border-[var(--glass-border)]">
              <button
                onClick={() => insertHeading(1)}
                className="p-2 rounded-lg hover:bg-[var(--glass-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                title="一级标题 (Ctrl+1)"
              >
                <Heading1 size={16} />
              </button>
              <button
                onClick={() => insertHeading(2)}
                className="p-2 rounded-lg hover:bg-[var(--glass-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                title="二级标题 (Ctrl+2)"
              >
                <Heading2 size={16} />
              </button>
              <button
                onClick={() => insertHeading(3)}
                className="p-2 rounded-lg hover:bg-[var(--glass-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                title="三级标题"
              >
                <Heading3 size={16} />
              </button>
            </div>

            {/* 插入 */}
            <div className="flex items-center gap-1 px-3 border-r border-[var(--glass-border)]">
              <button
                onClick={insertLink}
                className="p-2 rounded-lg hover:bg-[var(--glass-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                title="插入链接 (Ctrl+K)"
              >
                <Link size={16} />
              </button>
              <button
                onClick={insertImage}
                className="p-2 rounded-lg hover:bg-[var(--glass-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                title="插入图片"
              >
                <Image size={16} />
              </button>
              <button
                onClick={insertCode}
                className="p-2 rounded-lg hover:bg-[var(--glass-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                title="行内代码"
              >
                <Code size={16} />
              </button>
            </div>

            {/* 列表和引用 */}
            <div className="flex items-center gap-1 px-3 border-r border-[var(--glass-border)]">
              <button
                onClick={() => insertText('- ', '', '列表项')}
                className="p-2 rounded-lg hover:bg-[var(--glass-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                title="无序列表"
              >
                <List size={16} />
              </button>
              <button
                onClick={() => insertText('1. ', '', '列表项')}
                className="p-2 rounded-lg hover:bg-[var(--glass-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                title="有序列表"
              >
                <ListOrdered size={16} />
              </button>
              <button
                onClick={removeList}
                className="p-2 rounded-lg hover:bg-[var(--glass-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                title="移除列表格式"
              >
                <X size={16} />
              </button>
              <button
                onClick={() => insertText('> ', '', '引用文本')}
                className="p-2 rounded-lg hover:bg-[var(--glass-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                title="引用"
              >
                <Quote size={16} />
              </button>
              <button
                onClick={insertCodeBlock}
                className="p-2 rounded-lg hover:bg-[var(--glass-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                title="代码块"
              >
                <FileCode size={16} />
              </button>
            </div>

            {/* 操作 */}
            <div className="flex items-center gap-1 pl-3 ml-auto">
              <button
                onClick={() => setShowKeyboardShortcuts(!showKeyboardShortcuts)}
                className="p-2 rounded-lg hover:bg-[var(--glass-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                title="快捷键 (Ctrl+/)"
              >
                <Keyboard size={16} />
              </button>
              <button
                onClick={handleClear}
                className="p-2 rounded-lg hover:bg-[var(--glass-surface-hover)] text-[var(--text-secondary)] hover:text-red-400 transition-colors"
                title="清空"
              >
                <Trash2 size={16} />
              </button>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="p-2 rounded-lg hover:bg-[var(--glass-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                title={showPreview ? '隐藏预览' : '显示预览'}
              >
                {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-lg hover:bg-[var(--glass-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                title={isFullscreen ? '退出全屏' : '全屏编辑'}
              >
                {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
            </div>
          </div>
        </div>

        {/* 编辑器和预览区 */}
        <div>
            <div className={`grid gap-6 ${showPreview ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
              {/* 编辑器 */}
              <motion.div
                animate={{
                  filter: isSwitchingFile ? 'blur(8px)' : 'blur(0px)',
                  opacity: isSwitchingFile ? 0.5 : 1
                }}
                transition={{ duration: 0.15 }}
                className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-3xl p-6 backdrop-blur-2xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <input
                      type="text"
                      value={currentFile?.name || ''}
                      onChange={(e) => {
                        if (currentFileId) {
                          renameFile(currentFileId, e.target.value);
                        }
                      }}
                      className="text-lg font-semibold text-[var(--text-primary)] bg-transparent border-none p-0 focus:outline-none focus:ring-0"
                    />
                    <p className="text-xs text-[var(--text-tertiary)] mt-1">编辑器</p>
                  </div>
                  <div className="flex gap-2">
                    <label className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--glass-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm cursor-pointer">
                      <Upload size={14} />
                      导入
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".md,text/markdown"
                        onChange={handleImport}
                        className="hidden"
                      />
                    </label>
                    <button
                      onClick={handleCopyMarkdown}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors text-sm ${
                        copied
                          ? 'bg-green-500/20 text-green-400 border border-green-500/20'
                          : 'bg-[var(--glass-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      {copied ? '已复制' : '复制'}
                    </button>
                    <button
                      onClick={handleExportMD}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--glass-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm"
                    >
                      <Download size={14} />
                      导出
                    </button>
                  </div>
                </div>

                <textarea
                  ref={textareaRef}
                  id="markdown-textarea"
                  value={markdown}
                  onChange={(e) => setMarkdown(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="在此输入 Markdown 内容..."
                  className="w-full h-[500px] bg-[var(--glass-surface-hover)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-color)] transition-colors resize-none text-sm font-mono leading-relaxed custom-scrollbar"
                />

                <div className="flex gap-4 mt-3 text-xs text-[var(--text-tertiary)]">
                  <span>字符: {charCount.toLocaleString()}</span>
                  <span>单词: {wordCount.toLocaleString()}</span>
                  <span>行数: {lineCount.toLocaleString()}</span>
                  <span className="ml-auto text-green-400">自动保存中...</span>
                </div>
              </motion.div>

              {/* 预览 */}
              {showPreview && (
                <motion.div
                  animate={{
                    filter: isSwitchingFile ? 'blur(8px)' : 'blur(0px)',
                    opacity: isSwitchingFile ? 0.5 : 1
                  }}
                  transition={{ duration: 0.15 }}
                  className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-3xl p-6 backdrop-blur-2xl"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
                      <Eye size={18} className="text-[var(--accent-color)]" />
                      实时预览
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCopyHTML}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors text-sm ${
                          htmlCopied
                            ? 'bg-green-500/20 text-green-400 border border-green-500/20'
                            : 'bg-[var(--glass-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        {htmlCopied ? <Check size={14} /> : <Copy size={14} />}
                        {htmlCopied ? '已复制' : '复制 HTML'}
                      </button>
                      <button
                        onClick={handleExportHTML}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--glass-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm"
                      >
                        <FileDown size={14} />
                        导出 HTML
                      </button>
                    </div>
                  </div>

                  <div
                    ref={previewRef}
                    className="w-full h-[500px] bg-[var(--glass-surface-hover)] border border-[var(--glass-border)] rounded-xl px-6 py-4 overflow-y-auto custom-scrollbar prose prose-sm max-w-none"
                    style={{
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                      lineHeight: '1.75'
                    }}
                  >
                    {markdown ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code({ node, inline, className, children, ...props }: any) {
                            const match = /language-(\w+)/.exec(className || '');
                            return !inline && match ? (
                              <SyntaxHighlighter
                                style={oneDark}
                                language={match[1]}
                                PreTag="div"
                                customStyle={{
                                  background: 'var(--glass-surface-hover)',
                                  borderRadius: '8px',
                                  padding: '16px',
                                  margin: '8px 0'
                                }}
                                {...props}
                              >
                                {String(children).replace(/\n$/, '')}
                              </SyntaxHighlighter>
                            ) : (
                              <code
                                className="bg-[var(--accent-color)]/10 text-[var(--accent-color)] px-1.5 py-0.5 rounded text-sm"
                                {...props}
                              >
                                {children}
                              </code>
                            );
                          },
                          a({ children, href, ...props }: any) {
                            return (
                              <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[var(--accent-color)] hover:underline"
                                {...props}
                              >
                                {children}
                              </a>
                            );
                          },
                          blockquote({ children }: any) {
                            return (
                              <blockquote className="border-l-4 border-[var(--accent-color)] pl-4 italic my-4 text-[var(--text-secondary)]">
                                {children}
                              </blockquote>
                            );
                          },
                          table({ children }: any) {
                            return (
                              <div className="overflow-x-auto my-4">
                                <table className="min-w-full divide-y divide-[var(--glass-border)]">
                                  {children}
                                </table>
                              </div>
                            );
                          },
                          th({ children }: any) {
                            return (
                              <th className="px-4 py-2 bg-[var(--glass-surface-hover)] text-left text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                                {children}
                              </th>
                            );
                          },
                          td({ children }: any) {
                            return (
                              <td className="px-4 py-2 text-sm text-[var(--text-secondary)] border-t border-[var(--glass-border)]">
                                {children}
                              </td>
                            );
                          },
                          img({ src, alt, ...props }: any) {
                            return (
                              <img
                                src={src}
                                alt={alt}
                                className="rounded-lg max-w-full h-auto my-4"
                                loading="lazy"
                                {...props}
                              />
                            );
                          },
                          h1({ children }: any) {
                            return (
                              <h1 className="text-2xl font-bold text-[var(--text-primary)] mt-6 mb-4 pb-2 border-b border-[var(--glass-border)]">
                                {children}
                              </h1>
                            );
                          },
                          h2({ children }: any) {
                            return (
                              <h2 className="text-xl font-bold text-[var(--text-primary)] mt-5 mb-3">
                                {children}
                              </h2>
                            );
                          },
                          h3({ children }: any) {
                            return (
                              <h3 className="text-lg font-bold text-[var(--text-primary)] mt-4 mb-2">
                                {children}
                              </h3>
                            );
                          },
                          p({ children }: any) {
                            return (
                              <p className="my-3 leading-relaxed">
                                {children}
                              </p>
                            );
                          },
                          ul({ children }: any) {
                            return (
                              <ul className="list-disc list-inside my-3 space-y-1">
                                {children}
                              </ul>
                            );
                          },
                          ol({ children }: any) {
                            return (
                              <ol className="list-decimal list-inside my-3 space-y-1">
                                {children}
                              </ol>
                            );
                          },
                          hr() {
                            return (
                              <hr className="my-6 border-t border-[var(--glass-border)]" />
                            );
                          },
                          strong({ children }: any) {
                            return (
                              <strong className="font-bold text-[var(--text-primary)]">
                                {children}
                              </strong>
                            );
                          },
                          em({ children }: any) {
                            return (
                              <em className="italic text-[var(--text-secondary)]">
                                {children}
                              </em>
                            );
                          },
                        }}
                      >
                        {markdown}
                      </ReactMarkdown>
                    ) : (
                      <div className="h-full flex items-center justify-center text-[var(--text-tertiary)]">
                        <div className="text-center">
                          <FileText size={48} className="mx-auto mb-4 opacity-50" />
                          <p>开始编辑 Markdown 内容</p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
        </div>

        {/* 键盘快捷键提示 */}
        {showKeyboardShortcuts && (
          <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-3xl p-6 backdrop-blur-2xl">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Keyboard size={18} className="text-[var(--accent-color)]" />
              键盘快捷键
            </h3>

            <div className="mb-6">
              <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-3">基础编辑</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-[var(--glass-surface-hover)]">
                  <p className="text-xs text-[var(--text-tertiary)] mb-1">全选</p>
                  <p className="text-sm font-mono text-[var(--text-primary)]">Ctrl/⌘ + A</p>
                </div>
                <div className="p-3 rounded-xl bg-[var(--glass-surface-hover)]">
                  <p className="text-xs text-[var(--text-tertiary)] mb-1">复制</p>
                  <p className="text-sm font-mono text-[var(--text-primary)]">Ctrl/⌘ + C</p>
                </div>
                <div className="p-3 rounded-xl bg-[var(--glass-surface-hover)]">
                  <p className="text-xs text-[var(--text-tertiary)] mb-1">粘贴</p>
                  <p className="text-sm font-mono text-[var(--text-primary)]">Ctrl/⌘ + V</p>
                </div>
                <div className="p-3 rounded-xl bg-[var(--glass-surface-hover)]">
                  <p className="text-xs text-[var(--text-tertiary)] mb-1">剪切</p>
                  <p className="text-sm font-mono text-[var(--text-primary)]">Ctrl/⌘ + X</p>
                </div>
                <div className="p-3 rounded-xl bg-[var(--glass-surface-hover)]">
                  <p className="text-xs text-[var(--text-tertiary)] mb-1">撤销</p>
                  <p className="text-sm font-mono text-[var(--text-primary)]">Ctrl/⌘ + Z</p>
                </div>
                <div className="p-3 rounded-xl bg-[var(--glass-surface-hover)]">
                  <p className="text-xs text-[var(--text-tertiary)] mb-1">重做</p>
                  <p className="text-sm font-mono text-[var(--text-primary)]">Ctrl/⌘ + Y</p>
                </div>
                <div className="p-3 rounded-xl bg-[var(--glass-surface-hover)]">
                  <p className="text-xs text-[var(--text-tertiary)] mb-1">选中当前行</p>
                  <p className="text-sm font-mono text-[var(--text-primary)]">Ctrl/⌘ + D</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-3">Markdown 格式</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-[var(--glass-surface-hover)]">
                  <p className="text-xs text-[var(--text-tertiary)] mb-1">粗体</p>
                  <p className="text-sm font-mono text-[var(--text-primary)]">Ctrl/⌘ + B</p>
                </div>
                <div className="p-3 rounded-xl bg-[var(--glass-surface-hover)]">
                  <p className="text-xs text-[var(--text-tertiary)] mb-1">斜体</p>
                  <p className="text-sm font-mono text-[var(--text-primary)]">Ctrl/⌘ + I</p>
                </div>
                <div className="p-3 rounded-xl bg-[var(--glass-surface-hover)]">
                  <p className="text-xs text-[var(--text-tertiary)] mb-1">链接</p>
                  <p className="text-sm font-mono text-[var(--text-primary)]">Ctrl/⌘ + K</p>
                </div>
                <div className="p-3 rounded-xl bg-[var(--glass-surface-hover)]">
                  <p className="text-xs text-[var(--text-tertiary)] mb-1">保存</p>
                  <p className="text-sm font-mono text-[var(--text-primary)]">Ctrl/⌘ + S</p>
                </div>
                <div className="p-3 rounded-xl bg-[var(--glass-surface-hover)]">
                  <p className="text-xs text-[var(--text-tertiary)] mb-1">一级标题</p>
                  <p className="text-sm font-mono text-[var(--text-primary)]">Ctrl/⌘ + 1</p>
                </div>
                <div className="p-3 rounded-xl bg-[var(--glass-surface-hover)]">
                  <p className="text-xs text-[var(--text-tertiary)] mb-1">二级标题</p>
                  <p className="text-sm font-mono text-[var(--text-primary)]">Ctrl/⌘ + 2</p>
                </div>
                <div className="p-3 rounded-xl bg-[var(--glass-surface-hover)]">
                  <p className="text-xs text-[var(--text-tertiary)] mb-1">三级标题</p>
                  <p className="text-sm font-mono text-[var(--text-primary)]">Ctrl/⌘ + 3</p>
                </div>
                <div className="p-3 rounded-xl bg-[var(--glass-surface-hover)]">
                  <p className="text-xs text-[var(--text-tertiary)] mb-1">快捷键帮助</p>
                  <p className="text-sm font-mono text-[var(--text-primary)]">Ctrl/⌘ + /</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MarkdownEditor;
