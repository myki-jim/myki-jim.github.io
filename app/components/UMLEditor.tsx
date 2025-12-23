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
      name: 'Class Diagram',
      icon: <Box size={20} />,
      category: 'Structure',
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

Animal <|-- Dog : inherits
Animal <|-- Cat : inherits
Dog "1" -- "*" Toy : has
Cat "1" -- "*" Toy : has

class Toy {
  +name: String
  +type: String
  +play()
}
@enduml`,
      description: 'Object-oriented class relationships'
    },
    {
      name: 'Use Case Diagram',
      icon: <Users size={20} />,
      category: 'Requirements',
      code: `@startuml
left to right direction
actor System as system
actor Admin as admin
actor Customer as customer

rectangle "E-Commerce System" {
  system -- (User Management)
  system -- (Order Processing)
  system -- (Payment Processing)

  admin -- (User Management)
  admin -- (Inventory Management)
  admin -- (Reports)

  customer -- (User Management)
  customer -- (Order Processing)
  customer -- (Payment Processing)
  customer -- (Product Catalog)

  (Product Catalog) ..> (Order Processing) : includes
  (Order Processing) ..> (Payment Processing) : includes
  (User Management) ..> (Order Processing) : includes
}
@enduml`,
      description: 'System functionality from user perspective'
    },
    {
      name: 'Sequence Diagram',
      icon: <GitPullRequest size={20} />,
      category: 'Behavior',
      code: `@startuml
actor User
participant Frontend as UI
participant Backend as API
participant Database as DB
participant Payment as Pay

User -> UI: Click Checkout
UI -> API: POST /checkout
API -> DB: Validate cart items
DB --> API: Cart valid
API -> DB: Calculate total
DB --> API: Total amount
API -> Pay: Process payment
Pay --> API: Payment successful
API -> DB: Create order
DB --> API: Order created
API --> UI: Order confirmation
UI --> User: Show order details
@enduml`,
      description: 'Interaction between system components'
    },
    {
      name: 'Activity Diagram',
      icon: <Activity size={20} />,
      category: 'Behavior',
      code: `@startuml
start
:User logged in?;
if (Yes?) then (Yes)
  :Show Dashboard;
else (No)
  :Show Login Page;
  :Login successful?;
  if (Yes?) then (Yes)
    :Show Dashboard;
  else (No)
    :Show Error;
  endif
endif

:Select Action;
switch (Action Type?)
case (Profile)
  :Edit Profile;
  :Save Changes;
case (Settings)
  :Update Settings;
  :Save Changes;
case (Logout)
  :Clear Session;
  stop;
endswitch

:Save Changes;
detach;

@enduml`,
      description: 'Workflow and process flow'
    },
    {
      name: 'Component Diagram',
      icon: <Monitor size={20} />,
      category: 'Structure',
      code: `@startuml
package "Frontend" {
  [React App] as App
  [Redux Store] as Store
  [UI Components] as UI
}

package "Backend" {
  [Express API] as API
  [Authentication] as Auth
  [Business Logic] as Logic
  [Database Layer] as DB
}

package "External Services" {
  [Payment Gateway] as Pay
  [Email Service] as Email
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
      description: 'System architecture and components'
    },
    {
      name: 'State Diagram',
      icon: <GitBranch size={20} />,
      category: 'Behavior',
      code: `@startuml
[*] --> Created

Created --> Processing: Start
Processing --> Validated: Validate
Processing --> Failed: Error
Validated --> Processing: Revalidate
Validated --> Completed: Finish
Failed --> Processing: Retry
Failed --> Cancelled: Cancel

Completed --> [*]
Cancelled --> [*]

@enduml`,
      description: 'Object lifecycle and states'
    },
    {
      name: 'Package Diagram',
      icon: <Calendar size={20} />,
      category: 'Structure',
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
      description: 'Package structure and dependencies'
    },
    {
      name: 'Deployment Diagram',
      icon: <Shield size={20} />,
      category: 'Deployment',
      code: `@startuml
cloud "Cloud Infrastructure" {
  node "Load Balancer" {
    component [Nginx]
  }
  node "Web Servers" {
    component [Web Server 1]
    component [Web Server 2]
  }
  node "Application Server" {
    component [Node.js App]
  }
  node "Database Server" {
    component [PostgreSQL]
  }
  node "Cache Server" {
    component [Redis]
  }
}

node "External Services" {
  component [CDN]
  component [Backup Storage]
  component [Monitoring]
}

[CDN] --> [Nginx]
[Nginx] --> [Web Server 1]
[Nginx] --> [Web Server 2]
[Web Server 1] --> [Node.js App]
[Web Server 2] --> [Node.js App]
[Node.js App] --> [PostgreSQL]
[Node.js App] --> [Redis]
[PostgreSQL] --> [Backup Storage]
[Monitoring] --> [Nginx]
[Monitoring] --> [Node.js App]
[Monitoring] --> [PostgreSQL]
@enduml`,
      description: 'System deployment architecture'
    },
    {
      name: 'Object Diagram',
      icon: <LifeBuoy size={20} />,
      category: 'Structure',
      code: `@startuml
object john:User {
  name = "John"
  email = "john@example.com"
}
object order1:Order {
  id = 12345
  total = 99.99
}
object product1:Product {
  name = "Laptop"
  price = 999.99
}
object product2:Product {
  name = "Mouse"
  price = 29.99
}
object cart:ShoppingCart {
  items = 2
}

john --> order1 : places
order1 --> product1 : contains
order1 --> product2 : contains
john --> cart : owns
cart --> product1 : adds
cart --> product2 : adds
@enduml`,
      description: 'Object instances and their relationships'
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
      setError(`PlantUML encoding error: ${err instanceof Error ? err.message : 'Unknown error'}`);
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
        <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-3">UML Diagram Editor</h2>
        <p className="text-[var(--text-secondary)]">Professional UML diagramming tool with templates for all UML diagram types</p>
      </div>

      <div className="space-y-6">
        {/* Controls */}
        <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-3xl p-4 backdrop-blur-2xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <label className="text-sm text-[var(--text-secondary)]">Output:</label>
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value as 'svg' | 'svg-dark' | 'png')}
                className="px-3 py-2 bg-[var(--glass-surface-hover)] border border-[var(--glass-border)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-color)] transition-colors text-sm"
              >
                <option value="svg">SVG</option>
                <option value="svg-dark">SVG (Dark)</option>
                <option value="png">PNG</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={clearAll}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--glass-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm"
              >
                <RefreshCw size={14} />
                Clear
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
                {copied ? 'Copied!' : 'Copy Code'}
              </button>

              <button
                onClick={downloadCode}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--glass-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm"
              >
                <Download size={14} />
                Save Code
              </button>

              <button
                onClick={downloadSVG}
                disabled={!svgContent}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--glass-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ImageIcon size={14} />
                Export SVG
              </button>
            </div>
          </div>
        </div>

        {/* Templates */}
        <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-3xl p-6 backdrop-blur-2xl">
          <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-6 flex items-center gap-2">
            <FileText size={20} className="text-[var(--accent-color)]" />
            UML Templates
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
                UML Code
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
              placeholder="Select a template or write your UML diagram code here..."
              className="w-full h-[500px] bg-[var(--glass-surface-hover)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-color)] transition-colors resize-none text-sm font-mono leading-relaxed custom-scrollbar"
            />
          </div>

          {/* Preview Panel */}
          <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-3xl p-6 backdrop-blur-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <Eye size={18} className="text-[var(--accent-color)]" />
                Preview
              </h3>
            </div>
            <div className="w-full h-[500px] bg-[var(--glass-surface-hover)] border border-[var(--glass-border)] rounded-xl p-4 overflow-auto custom-scrollbar flex items-center justify-center">
              {error ? (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
                  <div className="flex items-start gap-2">
                    <X size={16} className="flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="block mb-1">Rendering Error</strong>
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
                    setError('Failed to load PlantUML diagram. Check your syntax.');
                    setSvgContent('');
                  }}
                />
              ) : (
                <div className="text-center text-[var(--text-tertiary)]">
                  <FileText size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-sm">Your UML diagram preview will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Reference */}
        <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-3xl p-6 backdrop-blur-2xl">
          <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-6">UML Diagram Types Reference</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[var(--glass-surface-hover)] border border-[var(--glass-border)]">
              <h4 className="font-bold text-[var(--accent-color)] mb-2 flex items-center gap-2">
                <Box size={16} />
                Structure Diagrams
              </h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Class, Object, Component, Package, and Deployment diagrams - show static structure of the system
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-[var(--glass-surface-hover)] border border-[var(--glass-border)]">
              <h4 className="font-bold text-[var(--accent-color)] mb-2 flex items-center gap-2">
                <Activity size={16} />
                Behavior Diagrams
              </h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Use Case, Activity, State, and Sequence diagrams - show dynamic behavior and interactions
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-[var(--glass-surface-hover)] border border-[var(--glass-border)]">
              <h4 className="font-bold text-[var(--accent-color)] mb-2 flex items-center gap-2">
                <Code size={16} />
                Key Concepts
              </h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Relationships, multiplicities, interfaces, inheritance, composition, and aggregation
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-[var(--glass-surface-hover)] border border-[var(--glass-border)]">
              <h4 className="font-bold text-[var(--accent-color)] mb-2 flex items-center gap-2">
                <Check size={16} />
                Best Practices
              </h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Keep diagrams simple, use consistent notation, and focus on relevant details
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UMLEditor;
