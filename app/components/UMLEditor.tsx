'use client';

import React, { useState, useEffect } from 'react';
import { encode } from 'plantuml-encoder';
import {
  Copy,
  Download,
  RefreshCw,
  Eye,
  Code,
  Box,
  GitPullRequest,
  Users,
  GitBranch,
  Activity,
  Monitor,
  Calendar,
  GitMerge,
  LifeBuoy,
  Shield,
  FileText,
  Image as ImageIcon,
  Check,
  X
} from 'lucide-react';

interface UMLTemplate {
  name: string;
  icon: React.ReactNode;
  category: string;
  code: string;
  description: string;
}

const UMLEditor: React.FC = () => {
  const [code, setCode] = useState<string>('');
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [outputFormat, setOutputFormat] = useState<'svg' | 'svg-dark' | 'png'>('svg');
  const [copied, setCopied] = useState<boolean>(false);

  // PlantUML Templates
  const umlTemplates: UMLTemplate[] = [
    {
      name: '类图',
      icon: <Box size={20} />,
      category: '结构图',
      code: `@startuml
class Animal {
  +name: String
  +age: int
  +species: String
  +makeSound()
  +eat()
  +sleep()
}
class Dog {
  +breed: String
  +color: String
  +bark()
  +wagTail()
}
class Cat {
  +indoor: boolean
  +meow()
  +purr()
}

Animal <|-- Dog : 继承
Animal <|-- Cat : 继承
Dog "1" -- "*" Toy : 拥有
Cat "1" -- "*" Toy : 拥有

class Toy {
  +name: String
  +type: String
  +play()
}
@enduml`,
      description: '面向对象的类关系'
    },
    {
      name: '用例图',
      icon: <Users size={20} />,
      category: '需求图',
      code: `@startuml
left to right direction
actor System as system
actor Admin as admin
actor Customer as customer

rectangle "电商系统" {
  system -- (用户管理)
  system -- (订单处理)
  system -- (支付处理)

  admin -- (用户管理)
  admin -- (库存管理)
  admin -- (报表)

  customer -- (用户管理)
  customer -- (订单处理)
  customer -- (支付处理)
  customer -- (产品目录)

  (产品目录) ..> (订单处理) : 包含
  (订单处理) ..> (支付处理) : 包含
  (用户管理) ..> (订单处理) : 包含
}
@enduml`,
      description: '从用户视角展示系统功能'
    },
    {
      name: '时序图',
      icon: <GitPullRequest size={20} />,
      category: '行为图',
      code: `@startuml
actor User
participant Frontend as UI
participant Backend as API
participant Database as DB
participant Payment as Pay

User -> UI: 点击结算
UI -> API: POST /checkout
API -> DB: 验证购物车商品
DB --> API: 购物车有效
API -> DB: 计算总额
DB --> API: 总金额
API -> Pay: 处理支付
Pay --> API: 支付成功
API -> DB: 创建订单
DB --> API: 订单已创建
API --> UI: 订单确认
UI --> User: 显示订单详情
@enduml`,
      description: '系统组件之间的交互'
    },
    {
      name: '活动图',
      icon: <Activity size={20} />,
      category: '行为图',
      code: `@startuml
start
:用户已登录?;
if (是?) then (是)
  :显示仪表板;
else (否)
  :显示登录页面;
  :登录成功?;
  if (是?) then (是)
    :显示仪表板;
  else (否)
    :显示错误;
  endif
endif

:选择操作;
switch (操作类型?)
case (个人资料)
  :编辑资料;
  :保存更改;
case (设置)
  :更新设置;
  :保存更改;
case (退出登录)
  :清除会话;
  stop;
endswitch

:保存更改;
detach;

@enduml`,
      description: '工作流程和过程流'
    },
    {
      name: '组件图',
      icon: <Monitor size={20} />,
      category: '结构图',
      code: `@startuml
package "前端" {
  [React 应用] as App
  [Redux 存储] as Store
  [UI 组件] as UI
}

package "后端" {
  [Express API] as API
  [身份认证] as Auth
  [业务逻辑] as Logic
  [数据库层] as DB
}

package "外部服务" {
  [支付网关] as Pay
  [邮件服务] as Email
  [CDN] as cdn
}

App --> Store
App --> UI
App --> API
API --> Auth
API --> Logic
Logic --> DB
Logic --> Pay
Logic --> Email
UI --> cdn
@enduml`,
      description: '系统架构和组件'
    },
    {
      name: '状态图',
      icon: <GitBranch size={20} />,
      category: '行为图',
      code: `@startuml
[*] --> 已创建

已创建 --> 处理中: 开始
处理中 --> 已验证: 验证
处理中 --> 失败: 错误
已验证 --> 处理中: 重新验证
已验证 --> 已完成: 完成
失败 --> 处理中: 重试
失败 --> 已取消: 取消

已完成 --> [*]
已取消 --> [*]

@enduml`,
      description: '对象生命周期和状态'
    },
    {
      name: '包图',
      icon: <Calendar size={20} />,
      category: '结构图',
      code: `@startuml
package "com.company" {
  package "controller" {
    [UserController] as UserCtrl
    [ProductController] as ProdCtrl
  }
  package "service" {
    [UserService] as UserService
    [ProductService] as ProdService
  }
  package "repository" {
    [UserRepository] as UserRepo
    [ProductRepository] as ProdRepo
  }
  package "model" {
    [User] as UserModel
    [Product] as ProdModel
  }
}

UserCtrl --> UserService
ProdCtrl --> ProdService
UserService --> UserRepo
ProdService --> ProdRepo
UserRepo --> UserModel
ProdRepo --> ProdModel
@enduml`,
      description: '包结构和依赖关系'
    },
    {
      name: '部署图',
      icon: <Shield size={20} />,
      category: '部署图',
      code: `@startuml
cloud "云基础设施" {
  node "负载均衡器" {
    component [Nginx]
  }
  node "Web 服务器" {
    component [Web 服务器 1]
    component [Web 服务器 2]
  }
  node "应用服务器" {
    component [Node.js 应用]
  }
  node "数据库服务器" {
    component [PostgreSQL]
  }
  node "缓存服务器" {
    component [Redis]
  }
}

node "外部服务" {
  component [CDN]
  component [备份存储]
  component [监控]
}

[CDN] --> [Nginx]
[Nginx] --> [Web 服务器 1]
[Nginx] --> [Web 服务器 2]
[Web 服务器 1] --> [Node.js 应用]
[Web 服务器 2] --> [Node.js 应用]
[Node.js 应用] --> [PostgreSQL]
[Node.js 应用] --> [Redis]
[PostgreSQL] --> [备份存储]
[监控] --> [Nginx]
[监控] --> [Node.js 应用]
[监控] --> [PostgreSQL]
@enduml`,
      description: '系统部署架构'
    },
    {
      name: '对象图',
      icon: <LifeBuoy size={20} />,
      category: '结构图',
      code: `@startuml
object john:User {
  name = "张三"
  email = "zhangsan@example.com"
}
object order1:Order {
  id = 12345
  total = 99.99
}
object product1:Product {
  name = "笔记本电脑"
  price = 999.99
}
object product2:Product {
  name = "鼠标"
  price = 29.99
}
object cart:ShoppingCart {
  items = 2
}

john --> order1 : 下单
order1 --> product1 : 包含
order1 --> product2 : 包含
john --> cart : 拥有
cart --> product1 : 添加
cart --> product2 : 添加
@enduml`,
      description: '对象实例及其关系'
    }
  ];

  useEffect(() => {
    if (code.trim()) {
      generatePlantUML();
    } else {
      setSvgContent('');
      setError('');
    }
  }, [code, outputFormat]);

  const generatePlantUML = () => {
    try {
      const encodedCode = encode(code);
      let plantumlServerUrl: string;

      switch (outputFormat) {
        case 'svg-dark':
          plantumlServerUrl = 'https://www.plantuml.com/plantuml/svg/';
          break;
        case 'png':
          plantumlServerUrl = 'https://www.plantuml.com/plantuml/png/';
          break;
        default:
          plantumlServerUrl = 'https://www.plantuml.com/plantuml/svg/';
      }

      const imageUrl = plantumlServerUrl + encodedCode;
      setSvgContent(imageUrl);
      setError('');
    } catch (err) {
      setError(`PlantUML 编码错误: ${err instanceof Error ? err.message : '未知错误'}`);
      setSvgContent('');
    }
  };

  const loadTemplate = (template: UMLTemplate) => {
    setCode(template.code);
    setSelectedTemplate(template.name);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadSVG = () => {
    if (!svgContent) return;

    // Fetch the SVG content
    fetch(svgContent)
      .then(response => response.text())
      .then(svgText => {
        const blob = new Blob([svgText], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `uml-diagram-${selectedTemplate || 'diagram'}.svg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      })
      .catch(err => {
        console.error('Failed to download SVG:', err);
        // Fallback: open in new tab
        window.open(svgContent, '_blank');
      });
  };

  const downloadPNG = () => {
    if (!svgContent) return;
    window.open(svgContent.replace('/svg/', '/png/'), '_blank');
  };

  const downloadCode = () => {
    if (!code.trim()) return;

    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uml-diagram-${selectedTemplate || 'diagram'}.puml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setCode('');
    setSvgContent('');
    setError('');
    setSelectedTemplate('');
  };

  const getTemplatesByCategory = () => {
    const categories: Record<string, UMLTemplate[]> = {};
    umlTemplates.forEach(template => {
      if (!categories[template.category]) {
        categories[template.category] = [];
      }
      categories[template.category].push(template);
    });
    return categories;
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-3">UML 图表编辑器</h2>
        <p className="text-[var(--text-secondary)]">专业的 UML 图表绘制工具，提供各类 UML 图表模板</p>
      </div>

      <div className="space-y-6">
        {/* Controls */}
        <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-3xl p-4 backdrop-blur-2xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <label className="text-sm text-[var(--text-secondary)]">输出格式:</label>
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value as 'svg' | 'svg-dark' | 'png')}
                className="px-3 py-2 bg-[var(--glass-surface-hover)] border border-[var(--glass-border)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-color)] transition-colors text-sm"
              >
                <option value="svg">SVG</option>
                <option value="svg-dark">SVG (暗色)</option>
                <option value="png">PNG</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={clearAll}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--glass-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm"
              >
                <RefreshCw size={14} />
                清空
              </button>

              <button
                onClick={() => copyToClipboard(code)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors text-sm ${
                  copied
                    ? 'bg-green-500/20 text-green-400 border border-green-500/20'
                    : 'bg-[var(--glass-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? '已复制!' : '复制代码'}
              </button>

              <button
                onClick={downloadCode}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--glass-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm"
              >
                <Download size={14} />
                保存代码
              </button>

              <button
                onClick={downloadSVG}
                disabled={!svgContent}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--glass-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ImageIcon size={14} />
                导出 SVG
              </button>
            </div>
          </div>
        </div>

        {/* Templates */}
        <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-3xl p-6 backdrop-blur-2xl">
          <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-6 flex items-center gap-2">
            <FileText size={20} className="text-[var(--accent-color)]" />
            UML 模板
          </h3>
          {Object.entries(getTemplatesByCategory()).map(([category, templates]) => (
            <div key={category} className="mb-8 last:mb-0">
              <h4 className="text-sm font-bold text-[var(--accent-color)] uppercase tracking-wider mb-4">{category}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template, index) => (
                  <button
                    key={index}
                    onClick={() => loadTemplate(template)}
                    className={`flex items-start gap-4 p-4 rounded-2xl border transition-all text-left ${
                      selectedTemplate === template.name
                        ? 'bg-[var(--accent-color)]/10 border-[var(--accent-color)] shadow-lg shadow-[var(--accent-color)]/10'
                        : 'bg-[var(--glass-surface-hover)] border-[var(--glass-border)] hover:border-[var(--accent-color)] hover:shadow-lg'
                    }`}
                  >
                    <div className={`p-3 rounded-xl flex-shrink-0 ${
                      selectedTemplate === template.name
                        ? 'bg-[var(--accent-color)] text-white'
                        : 'bg-[var(--accent-color)]/20 text-[var(--accent-color)]'
                    }`}>
                      {template.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-semibold text-[var(--text-primary)] mb-1">{template.name}</h5>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{template.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Editor and Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor Panel */}
          <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-3xl p-6 backdrop-blur-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <Code size={18} className="text-[var(--accent-color)]" />
                UML 代码
              </h3>
              {selectedTemplate && (
                <span className="px-3 py-1 rounded-full bg-[var(--accent-color)]/20 text-[var(--accent-color)] text-xs font-medium">
                  {selectedTemplate}
                </span>
              )}
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="选择模板或在此处编写您的 UML 图表代码..."
              className="w-full h-[500px] bg-[var(--glass-surface-hover)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-color)] transition-colors resize-none text-sm font-mono leading-relaxed custom-scrollbar"
            />
          </div>

          {/* Preview Panel */}
          <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-3xl p-6 backdrop-blur-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <Eye size={18} className="text-[var(--accent-color)]" />
                预览
              </h3>
            </div>
            <div className="w-full h-[500px] bg-[var(--glass-surface-hover)] border border-[var(--glass-border)] rounded-xl p-4 overflow-auto custom-scrollbar flex items-center justify-center">
              {error ? (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
                  <div className="flex items-start gap-2">
                    <X size={16} className="flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="block mb-1">渲染错误</strong>
                      <pre className="text-xs whitespace-pre-wrap">{error}</pre>
                    </div>
                  </div>
                </div>
              ) : svgContent ? (
                <img
                  src={svgContent}
                  alt="PlantUML Diagram"
                  className="max-w-full h-auto"
                  onError={(e) => {
                    setError('加载 PlantUML 图表失败。请检查语法。');
                    setSvgContent('');
                  }}
                />
              ) : (
                <div className="text-center text-[var(--text-tertiary)]">
                  <FileText size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-sm">您的 UML 图表预览将在此显示</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Reference */}
        <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-3xl p-6 backdrop-blur-2xl">
          <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-6">UML 图表类型参考</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[var(--glass-surface-hover)] border border-[var(--glass-border)]">
              <h4 className="font-bold text-[var(--accent-color)] mb-2 flex items-center gap-2">
                <Box size={16} />
                结构图
              </h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                类图、对象图、组件图、包图和部署图 - 展示系统的静态结构
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-[var(--glass-surface-hover)] border border-[var(--glass-border)]">
              <h4 className="font-bold text-[var(--accent-color)] mb-2 flex items-center gap-2">
                <Activity size={16} />
                行为图
              </h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                用例图、活动图、状态图和时序图 - 展示动态行为和交互
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-[var(--glass-surface-hover)] border border-[var(--glass-border)]">
              <h4 className="font-bold text-[var(--accent-color)] mb-2 flex items-center gap-2">
                <Code size={16} />
                核心概念
              </h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                关系、多重性、接口、继承、组合和聚合
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-[var(--glass-surface-hover)] border border-[var(--glass-border)]">
              <h4 className="font-bold text-[var(--accent-color)] mb-2 flex items-center gap-2">
                <Check size={16} />
                最佳实践
              </h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                保持图表简洁,使用一致的符号,专注于相关细节
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UMLEditor;
