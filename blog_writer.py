#!/usr/bin/env python3
"""
Hexo 博客写作工具 - 增强版

功能:
- 创建新博客文章
- 列出现有文章
- 本地预览服务器
- 文章搜索
- Git 集成
- 批量操作
- 调试工具

使用方法:
python blog_writer.py [command] [options]
"""

import os
import sys
import json
import argparse
import subprocess
import datetime
import time
import webbrowser
import threading
from pathlib import Path
from typing import List, Optional, Dict
import git


class HexoBlogWriter:
    def __init__(self, blog_path: str = "."):
        self.blog_path = Path(blog_path).resolve()
        self.posts_dir = self.blog_path / "source" / "_posts"
        self.pages_dir = self.blog_path / "source"
        self.config_file = self.blog_path / "_config.yml"

        if not self.posts_dir.exists():
            raise FileNotFoundError(f"博客目录不存在: {self.posts_dir}")

        # 初始化Git仓库
        try:
            self.repo = git.Repo(str(self.blog_path))
            print(f"Git仓库初始化成功: {self.repo.git_dir}")
        except Exception as e:
            print(f"Git仓库初始化失败: {e}")
            # 尝试查找上级目录的Git仓库
            try:
                current_path = self.blog_path
                for _ in range(5):  # 最多向上查找5级目录
                    parent = current_path.parent
                    if (parent / '.git').exists():
                        self.repo = git.Repo(str(parent))
                        print(f"在上级目录找到Git仓库: {parent}")
                        break
                    current_path = parent
                else:
                    self.repo = None
            except Exception:
                self.repo = None

    def create_post(self, title: str, tags: List[str] = None, categories: List[str] = None,
                   layout: str = "post", draft: bool = False) -> str:
        """创建新博客文章"""
        if not title:
            raise ValueError("标题不能为空")

        # 生成文件名 (日期 + 标题)
        date_str = datetime.datetime.now().strftime("%Y-%m-%d")
        filename = f"{date_str}-{title.lower().replace(' ', '-')}.md"

        if draft:
            filename = f"draft-{filename}"

        file_path = self.posts_dir / filename

        if file_path.exists():
            raise FileExistsError(f"文章已存在: {filename}")

        # 生成 front matter
        front_matter = self._generate_front_matter(title, tags, categories, layout)

        # 创建文件
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(front_matter)
            f.write(f"\n\n# {title}\n\n")
            f.write("在这里开始写你的内容...\n\n")
            f.write("<!-- more -->\n\n")
            f.write("## 继续你的内容\n\n")

        print(f"✅ 文章创建成功: {filename}")
        print(f"📁 路径: {file_path}")

        # 询问是否用编辑器打开
        try:
            response = input("是否现在用编辑器打开文章? (y/N): ").strip().lower()
            if response in ['y', 'yes']:
                self._open_editor(file_path)
        except KeyboardInterrupt:
            print("\n操作已取消")

        return str(file_path)

    def create_page(self, title: str, layout: str = "page") -> str:
        """创建新页面"""
        if not title:
            raise ValueError("页面标题不能为空")

        # 生成页面目录名（英文，小写，用连字符）
        import re
        page_slug = re.sub(r'[^\w\s-]', '', title.lower())
        page_slug = re.sub(r'[-\s]+', '-', page_slug).strip('-')

        # 创建页面目录
        page_dir = self.pages_dir / page_slug
        page_dir.mkdir(exist_ok=True)

        # 创建页面文件
        page_file = page_dir / "index.md"

        if page_file.exists():
            raise FileExistsError(f"页面已存在: {page_slug}")

        # 生成 front matter
        date_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        front_matter = f"""---
title: {title}
date: {date_str}
layout: {layout}
---

"""

        # 创建文件
        with open(page_file, 'w', encoding='utf-8') as f:
            f.write(front_matter)
            f.write(f"# {title}\n\n")
            f.write("在这里开始写页面内容...\n\n")

        print(f"✅ 页面创建成功: {page_slug}")
        print(f"📁 路径: {page_file}")

        return str(page_file)

    def list_pages(self) -> List[Dict]:
        """列出所有页面"""
        pages = []

        # 查找所有页面目录（排除 _posts）
        for item in self.pages_dir.iterdir():
            if item.is_dir() and item.name != "_posts":
                page_file = item / "index.md"
                if page_file.exists():
                    page_info = self._parse_post_info(page_file)
                    page_info['page_slug'] = item.name
                    pages.append(page_info)

        # 按日期排序
        pages.sort(key=lambda x: x.get('date', ''), reverse=True)

        return pages

    def get_page_info(self, page_slug: str) -> Dict:
        """获取页面信息"""
        page_file = self.pages_dir / page_slug / "index.md"

        if not page_file.exists():
            raise FileNotFoundError(f"页面不存在: {page_slug}")

        page_info = self._parse_post_info(page_file)
        page_info['page_slug'] = page_slug
        return page_info

    def update_page(self, page_slug: str, title: str = None, layout: str = None, content: str = None) -> bool:
        """更新页面"""
        try:
            page_file = self.pages_dir / page_slug / "index.md"

            if not page_file.exists():
                raise FileNotFoundError(f"页面不存在: {page_slug}")

            # 读取现有内容
            with open(page_file, 'r', encoding='utf-8') as f:
                lines = f.readlines()

            # 找到front matter的结束位置
            front_matter_end = -1
            if lines and lines[0].strip() == '---':
                for i in range(1, len(lines)):
                    if lines[i].strip() == '---':
                        front_matter_end = i
                        break

            # 解析现有front matter
            existing_info = self._parse_post_info(page_file)

            # 更新信息
            new_title = title if title else existing_info.get('title', 'Untitled')
            new_layout = layout if layout else existing_info.get('layout', 'page')

            # 构建新的front matter
            new_front_matter = f"""---
title: {new_title}
date: {existing_info.get('date', '')}
layout: {new_layout}
---

"""

            # 写入新内容
            if front_matter_end != -1:
                # 保留原有内容，只替换front matter
                content_after_front_matter = ''.join(lines[front_matter_end + 1:])
                new_content = new_front_matter + (content if content else content_after_front_matter)
            else:
                # 如果没有front matter，直接添加
                new_content = new_front_matter + (content if content else ''.join(lines))

            with open(page_file, 'w', encoding='utf-8') as f:
                f.write(new_content)

            return True
        except Exception as e:
            print(f"更新页面失败: {e}")
            return False

    def delete_page(self, page_slug: str) -> bool:
        """删除页面"""
        try:
            page_dir = self.pages_dir / page_slug

            if not page_dir.exists():
                raise FileNotFoundError(f"页面不存在: {page_slug}")

            import shutil
            shutil.rmtree(page_dir)
            print(f"✅ 页面删除成功: {page_slug}")
            return True
        except Exception as e:
            print(f"删除页面失败: {e}")
            return False

    def list_posts(self, limit: int = 10, category: str = None, tag: str = None) -> List[Dict]:
        """列出博客文章"""
        posts = []

        for file_path in self.posts_dir.glob("*.md"):
            if file_path.name.startswith("draft-"):
                continue

            post_info = self._parse_post_info(file_path)

            # 过滤条件
            if category and category not in post_info.get('categories', []):
                continue
            if tag and tag not in post_info.get('tags', []):
                continue

            posts.append(post_info)

        # 按日期排序
        posts.sort(key=lambda x: x.get('date', ''), reverse=True)

        # 显示结果
        if posts:
            print(f"\n📝 找到 {len(posts)} 篇文章:")
            print("-" * 80)
            for i, post in enumerate(posts[:limit], 1):
                status = "📅" if post.get('published', True) else "📝"
                tags_str = ", ".join(post.get('tags', [])) if post.get('tags') else "无标签"
                categories_str = ", ".join(post.get('categories', [])) if post.get('categories') else "无分类"

                print(f"{i:2d}. {status} {post['title']}")
                print(f"     📁 {post['filename']}")
                print(f"     📆 {post.get('date', '未知日期')}")
                print(f"     🏷️  {tags_str}")
                print(f"     📂 {categories_str}")
                print()
        else:
            print("❌ 没有找到符合条件的文章")

        return posts

    def search_posts(self, keyword: str) -> List[Dict]:
        """搜索文章"""
        results = []

        for file_path in self.posts_dir.glob("*.md"):
            if file_path.name.startswith("draft-"):
                continue

            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read().lower()

                if keyword.lower() in content:
                    post_info = self._parse_post_info(file_path)
                    # 添加匹配内容预览
                    lines = content.split('\n')
                    preview_lines = []
                    for line in lines:
                        if keyword.lower() in line:
                            preview_lines.append(line.strip())

                    post_info['matches'] = preview_lines[:3]  # 只显示前3个匹配
                    results.append(post_info)

            except Exception as e:
                print(f"⚠️  读取文件失败 {file_path}: {e}")

        # 显示结果
        if results:
            print(f"\n🔍 搜索 '{keyword}' 找到 {len(results)} 篇文章:")
            print("-" * 80)
            for i, post in enumerate(results, 1):
                print(f"{i}. 📝 {post['title']}")
                print(f"   📁 {post['filename']}")
                print(f"   📅 {post.get('date', '未知日期')}")
                if post.get('matches'):
                    print("   💡 匹配内容:")
                    for match in post['matches']:
                        print(f"      ...{match}...")
                print()
        else:
            print(f"❌ 没有找到包含 '{keyword}' 的文章")

        return results

    def preview_server(self, port: int = 4000):
        """启动本地预览服务器"""
        print(f"🚀 启动 Hexo 本地服务器...")
        print(f"📱 访问地址: http://localhost:{port}")
        print("💡 按 Ctrl+C 停止服务器")

        try:
            subprocess.run([
                "npx", "hexo", "server", "--port", str(port)
            ], cwd=self.blog_path)
        except KeyboardInterrupt:
            print("\n⏹️  服务器已停止")
        except FileNotFoundError:
            print("❌ 未找到 Hexo 命令，请确保已安装依赖")

    def generate_site(self):
        """生成静态网站"""
        print("🔨 正在生成静态网站...")

        try:
            # 清理
            subprocess.run(["npx", "hexo", "clean"], cwd=self.blog_path, check=True)
            print("✅ 清理完成")

            # 生成
            subprocess.run(["npx", "hexo", "generate"], cwd=self.blog_path, check=True)
            print("✅ 网站生成完成")
            print(f"📁 静态文件位于: {self.blog_path / 'public'}")

        except subprocess.CalledProcessError as e:
            print(f"❌ 生成失败: {e}")
        except FileNotFoundError:
            print("❌ 未找到 Hexo 命令，请确保已安装依赖")

    def deploy_site(self):
        """部署网站"""
        print("🚀 正在部署网站...")

        try:
            subprocess.run(["npx", "hexo", "deploy"], cwd=self.blog_path, check=True)
            print("✅ 部署完成")

        except subprocess.CalledProcessError as e:
            print(f"❌ 部署失败: {e}")
        except FileNotFoundError:
            print("❌ 未找到 Hexo 命令，请确保已安装依赖")

    def _generate_front_matter(self, title: str, tags: List[str] = None,
                              categories: List[str] = None, layout: str = "post") -> str:
        """生成 front matter"""
        now = datetime.datetime.now()
        date_str = now.strftime("%Y-%m-%d %H:%M:%S")

        front_matter = "---\n"
        front_matter += f"title: {title}\n"
        front_matter += f"date: {date_str}\n"

        if tags:
            front_matter += f"tags: [{', '.join([f'{tag}' for tag in tags])}]\n"

        if categories:
            front_matter += f"categories: [{', '.join([f'{cat}' for cat in categories])}]\n"

        front_matter += f"layout: {layout}\n"
        front_matter += "---\n"

        return front_matter

    def _parse_post_info(self, file_path: Path) -> Dict:
        """解析文章信息"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()

            # 解析 front matter
            front_matter = {}
            if content.startswith('---'):
                end_idx = content.find('---', 3)
                if end_idx != -1:
                    fm_text = content[3:end_idx].strip()
                    for line in fm_text.split('\n'):
                        if ':' in line:
                            key, value = line.split(':', 1)
                            key = key.strip()
                            value = value.strip().strip('"\'')

                            # 处理数组格式
                            if value.startswith('[') and value.endswith(']'):
                                value = value[1:-1].split(',')
                                value = [v.strip().strip('"\'') for v in value if v.strip()]

                            front_matter[key] = value

            return {
                'filename': file_path.name,
                'path': str(file_path),
                'title': front_matter.get('title', file_path.stem),
                'date': front_matter.get('date', ''),
                'tags': front_matter.get('tags', []),
                'categories': front_matter.get('categories', []),
                'layout': front_matter.get('layout', 'post'),
                'published': front_matter.get('published', True)
            }

        except Exception as e:
            return {
                'filename': file_path.name,
                'path': str(file_path),
                'title': file_path.stem,
                'date': '',
                'tags': [],
                'categories': [],
                'layout': 'post',
                'published': True
            }

    def _open_editor(self, file_path: Path):
        """用默认编辑器打开文件"""
        import subprocess
        import platform

        try:
            if platform.system() == 'Darwin':  # macOS
                subprocess.run(['open', str(file_path)])
            elif platform.system() == 'Windows':
                os.startfile(str(file_path))
            else:  # Linux
                subprocess.run(['xdg-open', str(file_path)])
        except Exception as e:
            print(f"⚠️  无法打开编辑器: {e}")
            print(f"请手动打开文件: {file_path}")

    def git_status(self) -> Dict:
        """获取Git状态"""
        if not self.repo:
            return {"error": "Git仓库未初始化"}

        try:
            # 检查是否有未提交的更改
            is_clean = not self.repo.is_dirty(untracked_files=True)

            # 确保我们在正确的工作目录
            import os
            original_cwd = os.getcwd()
            os.chdir(str(self.blog_path))

            status = {
                "is_clean": is_clean,
                "branch": self.repo.active_branch.name,
                "untracked_files": list(self.repo.untracked_files),
                "modified_files": [item.a_path for item in self.repo.index.diff(None)],
                "staged_files": [item.a_path for item in self.repo.index.diff("HEAD")]
            }

            # 恢复工作目录
            os.chdir(original_cwd)

            return status
        except Exception as e:
            return {"error": str(e)}

    def git_commit(self, message: str = "更新博客") -> bool:
        """Git提交"""
        if not self.repo:
            print("❌ Git仓库未初始化")
            return False

        try:
            # 添加所有文件
            self.repo.git.add('--all')

            # 检查是否有需要提交的内容
            if self.repo.is_dirty(untracked_files=True):
                self.repo.index.commit(message)
                print("✅ 提交成功")
                return True
            else:
                print("ℹ️  没有需要提交的更改")
                return False

        except Exception as e:
            print(f"❌ 提交失败: {e}")
            return False

    def git_push(self) -> bool:
        """Git推送"""
        if not self.repo:
            print("❌ Git仓库未初始化")
            return False

        try:
            origin = self.repo.remote(name='origin')
            origin.push()
            print("✅ 推送成功")
            return True

        except Exception as e:
            print(f"❌ 推送失败: {e}")
            return False

    def git_pull(self) -> bool:
        """Git拉取"""
        if not self.repo:
            print("❌ Git仓库未初始化")
            return False

        try:
            origin = self.repo.remote(name='origin')
            origin.pull()
            print("✅ 拉取成功")
            return True

        except Exception as e:
            print(f"❌ 拉取失败: {e}")
            return False

    def start_server(self, port: int = 4000, open_browser: bool = True) -> None:
        """启动Hexo本地服务器"""
        def _run_server():
            try:
                print(f"🚀 启动Hexo服务器 (端口: {port})...")
                print("💡 按 Ctrl+C 停止服务器")
                print(f"📱 访问地址: http://localhost:{port}")

                subprocess.run([
                    "npx", "hexo", "server", "--port", str(port)
                ], cwd=self.blog_path)
            except KeyboardInterrupt:
                print("\n⏹️  服务器已停止")
            except FileNotFoundError:
                print("❌ 未找到Hexo命令，请确保已安装依赖")

        # 在新线程中启动服务器
        server_thread = threading.Thread(target=_run_server, daemon=True)
        server_thread.start()

        # 等待服务器启动
        time.sleep(2)

        # 打开浏览器
        if open_browser:
            webbrowser.open(f"http://localhost:{port}")

        return server_thread

    def check_links(self) -> List[str]:
        """检查文章中的链接"""
        issues = []

        for file_path in self.posts_dir.glob("*.md"):
            if file_path.name.startswith("draft-"):
                continue

            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()

                # 检查Markdown链接
                import re
                links = re.findall(r'\[([^\]]*)\]\(([^)]+)\)', content)

                for text, url in links:
                    if url.startswith('http'):
                        continue  # 外部链接跳过检查

                    # 检查相对路径文件是否存在
                    if url.startswith('./'):
                        file_to_check = self.blog_path / url[2:]
                    elif url.startswith('/'):
                        file_to_check = self.blog_path / url[1:]
                    else:
                        # 相对于当前文章的路径
                        file_to_check = file_path.parent / url

                    if not file_to_check.exists():
                        issues.append(f"{file_path.name}: 链接失效 - [{text}]({url})")

                # 检查图片链接
                images = re.findall(r'!\[([^\]]*)\]\(([^)]+)\)', content)
                for alt, src in images:
                    if src.startswith('http'):
                        continue

                    if src.startswith('./'):
                        img_to_check = self.blog_path / src[2:]
                    elif src.startswith('/'):
                        img_to_check = self.blog_path / src[1:]
                    else:
                        img_to_check = file_path.parent / src

                    if not img_to_check.exists():
                        issues.append(f"{file_path.name}: 图片缺失 - ![{alt}]({src})")

            except Exception as e:
                issues.append(f"{file_path.name}: 读取文件失败 - {e}")

        return issues

    def validate_posts(self) -> Dict[str, List]:
        """验证文章格式"""
        issues = {
            "missing_front_matter": [],
            "missing_title": [],
            "missing_date": [],
            "invalid_date": [],
            "duplicate_titles": []
        }

        titles = set()

        for file_path in self.posts_dir.glob("*.md"):
            if file_path.name.startswith("draft-"):
                continue

            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()

                # 检查front matter
                if not content.startswith('---'):
                    issues["missing_front_matter"].append(file_path.name)
                    continue

                # 解析front matter
                end_idx = content.find('---', 3)
                if end_idx == -1:
                    issues["missing_front_matter"].append(file_path.name)
                    continue

                fm_text = content[3:end_idx].strip()
                front_matter = {}

                for line in fm_text.split('\n'):
                    if ':' in line:
                        key, value = line.split(':', 1)
                        front_matter[key.strip()] = value.strip().strip('"\'')

                # 检查必需字段
                if 'title' not in front_matter:
                    issues["missing_title"].append(file_path.name)

                if 'date' not in front_matter:
                    issues["missing_date"].append(file_path.name)
                else:
                    # 验证日期格式
                    try:
                        datetime.datetime.strptime(front_matter['date'], '%Y-%m-%d %H:%M:%S')
                    except ValueError:
                        issues["invalid_date"].append(file_path.name)

                # 检查重复标题
                title = front_matter.get('title', '')
                if title in titles:
                    issues["duplicate_titles"].append(title)
                titles.add(title)

            except Exception as e:
                issues["missing_front_matter"].append(f"{file_path.name}: {e}")

        return issues

    def get_blog_stats(self) -> Dict:
        """获取博客统计信息"""
        stats = {
            "total_posts": 0,
            "total_tags": set(),
            "total_categories": set(),
            "last_updated": None,
            "word_count": 0
        }

        latest_date = None

        for file_path in self.posts_dir.glob("*.md"):
            if file_path.name.startswith("draft-"):
                continue

            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()

                post_info = self._parse_post_info(file_path)
                stats["total_posts"] += 1

                # 收集标签和分类
                stats["total_tags"].update(post_info.get('tags', []))
                stats["total_categories"].update(post_info.get('categories', []))

                # 统计字数（去除front matter）
                front_matter_end = content.find('---', 3)
                if front_matter_end != -1:
                    content_text = content[front_matter_end + 3:]
                else:
                    content_text = content

                # 移除Markdown语法
                import re
                content_text = re.sub(r'[#*`\[\]()]', '', content_text)
                content_text = re.sub(r'!\[.*?\]\(.*?\)', '', content_text)
                content_text = re.sub(r'\[.*?\]\(.*?\)', '', content_text)

                stats["word_count"] += len(content_text.split())

                # 找到最新更新时间
                post_date = post_info.get('date', '')
                if post_date:
                    try:
                        current_date = datetime.datetime.strptime(post_date, '%Y-%m-%d %H:%M:%S')
                        if not latest_date or current_date > latest_date:
                            latest_date = current_date
                    except ValueError:
                        pass

            except Exception:
                pass

        # 转换set为list以便JSON序列化
        stats["total_tags"] = list(stats["total_tags"])
        stats["total_categories"] = list(stats["total_categories"])
        stats["last_updated"] = latest_date.strftime('%Y-%m-%d %H:%M:%S') if latest_date else None

        return stats

    def backup_blog(self, backup_dir: str = None) -> str:
        """备份博客"""
        if not backup_dir:
            timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
            backup_dir = f"blog_backup_{timestamp}"

        backup_path = Path(backup_dir)

        try:
            # 创建备份目录
            backup_path.mkdir(exist_ok=True)

            # 复制重要文件和目录
            import shutil

            # 备份文章
            if self.posts_dir.exists():
                shutil.copytree(self.posts_dir, backup_path / "_posts", dirs_exist_ok=True)

            # 备份配置文件
            for config_file in ['_config.yml', '_config.next.yml', 'package.json']:
                src = self.blog_path / config_file
                if src.exists():
                    shutil.copy2(src, backup_path)

            # 备份主题（如果是自定义主题）
            themes_dir = self.blog_path / "themes"
            if themes_dir.exists():
                shutil.copytree(themes_dir, backup_path / "themes", dirs_exist_ok=True)

            # 创建备份信息文件
            backup_info = {
                "backup_time": datetime.datetime.now().isoformat(),
                "total_posts": len(list(self.posts_dir.glob("*.md"))),
                "blog_path": str(self.blog_path)
            }

            with open(backup_path / "backup_info.json", 'w', encoding='utf-8') as f:
                json.dump(backup_info, f, indent=2, ensure_ascii=False)

            print(f"✅ 备份完成: {backup_path.absolute()}")
            return str(backup_path.absolute())

        except Exception as e:
            print(f"❌ 备份失败: {e}")
            raise

    def start_web_interface(self, port: int = 5000) -> None:
        """启动Web界面"""
        web_app_path = self.blog_path / "blog_tools" / "web"
        app_file = web_app_path / "app.py"

        if not app_file.exists():
            print("❌ Web应用文件不存在")
            return

        try:
            # 检查Flask是否安装
            import flask
            print(f"🌐 启动Web界面 (端口: {port})...")
            print(f"📱 访问地址: http://localhost:{port}")
            print("💡 按 Ctrl+C 停止Web界面")

            # 在子进程中启动Flask应用
            subprocess.run([
                sys.executable, str(app_file)
            ], cwd=str(web_app_path))

        except ImportError:
            print("❌ 未安装Flask，请运行: pip install flask")
        except FileNotFoundError:
            print("❌ Python未找到")
        except KeyboardInterrupt:
            print("\n⏹️  Web界面已停止")


def main():
    parser = argparse.ArgumentParser(description='Hexo 博客写作工具')
    parser.add_argument('--path', default='.', help='博客路径 (默认: 当前目录)')

    subparsers = parser.add_subparsers(dest='command', help='可用命令')

    # 创建文章命令
    create_parser = subparsers.add_parser('new', help='创建新文章')
    create_parser.add_argument('title', help='文章标题')
    create_parser.add_argument('--tags', nargs='*', help='文章标签')
    create_parser.add_argument('--categories', nargs='*', help='文章分类')
    create_parser.add_argument('--layout', default='post', help='布局类型')
    create_parser.add_argument('--draft', action='store_true', help='创建为草稿')

    # 列出文章命令
    list_parser = subparsers.add_parser('list', help='列出文章')
    list_parser.add_argument('--limit', type=int, default=10, help='显示数量限制')
    list_parser.add_argument('--category', help='按分类过滤')
    list_parser.add_argument('--tag', help='按标签过滤')

    # 搜索命令
    search_parser = subparsers.add_parser('search', help='搜索文章')
    search_parser.add_argument('keyword', help='搜索关键词')

    # 预览命令
    preview_parser = subparsers.add_parser('serve', help='启动本地服务器')
    preview_parser.add_argument('--port', type=int, default=4000, help='端口号')

    # 生成命令
    subparsers.add_parser('generate', help='生成静态网站')

    # 部署命令
    subparsers.add_parser('deploy', help='部署网站')

    # Git相关命令
    git_parser = subparsers.add_parser('git', help='Git操作')
    git_subparsers = git_parser.add_subparsers(dest='git_command', help='Git命令')
    git_subparsers.add_parser('status', help='查看Git状态')
    git_subparsers.add_parser('commit', help='提交更改')
    git_subparsers.add_parser('push', help='推送到远程')
    git_subparsers.add_parser('pull', help='拉取更改')

    # 调试命令
    debug_parser = subparsers.add_parser('debug', help='调试工具')
    debug_subparsers = debug_parser.add_subparsers(dest='debug_command', help='调试命令')
    debug_subparsers.add_parser('links', help='检查链接')
    debug_subparsers.add_parser('validate', help='验证文章格式')
    debug_subparsers.add_parser('stats', help='显示统计信息')

    # 备份命令
    backup_parser = subparsers.add_parser('backup', help='备份博客')
    backup_parser.add_argument('--dir', help='备份目录路径')

    # Web界面命令
    subparsers.add_parser('web', help='启动Web界面')

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        return

    try:
        writer = HexoBlogWriter(args.path)

        if args.command == 'new':
            writer.create_post(
                title=args.title,
                tags=args.tags,
                categories=args.categories,
                layout=args.layout,
                draft=args.draft
            )

        elif args.command == 'list':
            writer.list_posts(
                limit=args.limit,
                category=args.category,
                tag=args.tag
            )

        elif args.command == 'search':
            writer.search_posts(args.keyword)

        elif args.command == 'serve':
            writer.preview_server(port=args.port)

        elif args.command == 'generate':
            writer.generate_site()

        elif args.command == 'deploy':
            writer.deploy_site()

        # Git命令
        elif args.command == 'git':
            if args.git_command == 'status':
                status = writer.git_status()
                if 'error' in status:
                    print(f"❌ {status['error']}")
                else:
                    print("📋 Git状态:")
                    print(f"   分支: {status['branch']}")
                    print(f"   状态: {'✅ 干净' if status['is_clean'] else '⚠️  有更改'}")
                    if status['untracked_files']:
                        print(f"   未跟踪文件: {len(status['untracked_files'])} 个")
                        for file in status['untracked_files'][:5]:
                            print(f"     • {file}")
                        if len(status['untracked_files']) > 5:
                            print(f"     ... 还有 {len(status['untracked_files']) - 5} 个文件")
                    if status['modified_files']:
                        print(f"   修改文件: {len(status['modified_files'])} 个")
                        for file in status['modified_files'][:5]:
                            print(f"     • {file}")
                        if len(status['modified_files']) > 5:
                            print(f"     ... 还有 {len(status['modified_files']) - 5} 个文件")

            elif args.git_command == 'commit':
                message = input("请输入提交信息 (默认: 更新博客): ").strip()
                message = message or "更新博客"
                writer.git_commit(message)

            elif args.git_command == 'push':
                writer.git_push()

            elif args.git_command == 'pull':
                writer.git_pull()

            else:
                print("❌ 请指定Git命令 (status, commit, push, pull)")

        # 调试命令
        elif args.command == 'debug':
            if args.debug_command == 'links':
                print("🔍 检查文章链接...")
                issues = writer.check_links()
                if issues:
                    print(f"❌ 发现 {len(issues)} 个问题:")
                    for issue in issues:
                        print(f"   • {issue}")
                else:
                    print("✅ 所有链接检查通过")

            elif args.debug_command == 'validate':
                print("🔍 验证文章格式...")
                issues = writer.validate_posts()
                total_issues = sum(len(issue_list) for issue_list in issues.values())

                if total_issues > 0:
                    print(f"❌ 发现 {total_issues} 个问题:")
                    for issue_type, issue_list in issues.items():
                        if issue_list:
                            print(f"\n   {issue_type.replace('_', ' ').title()}:")
                            for item in issue_list:
                                print(f"     • {item}")
                else:
                    print("✅ 所有文章格式验证通过")

            elif args.debug_command == 'stats':
                print("📊 博客统计信息:")
                stats = writer.get_blog_stats()
                print(f"   文章总数: {stats['total_posts']}")
                print(f"   总字数: {stats['word_count']:,}")
                print(f"   标签数量: {len(stats['total_tags'])}")
                print(f"   分类数量: {len(stats['total_categories'])}")
                if stats['last_updated']:
                    print(f"   最后更新: {stats['last_updated']}")

                if stats['total_tags']:
                    print(f"\n   标签列表: {', '.join(stats['total_tags'])}")
                if stats['total_categories']:
                    print(f"\n   分类列表: {', '.join(stats['total_categories'])}")

            else:
                print("❌ 请指定调试命令 (links, validate, stats)")

        # 备份命令
        elif args.command == 'backup':
            print("💾 开始备份博客...")
            backup_path = writer.backup_blog(args.dir)

        elif args.command == 'web':
            # 启动Web界面
            writer.start_web_interface()

    except Exception as e:
        print(f"❌ 错误: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()