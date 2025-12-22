#!/usr/bin/env python3
"""
Hexo 博客写作工具 - Web界面
提供可视化的博客管理界面
"""

import os
import sys
import json
import subprocess
from datetime import datetime
from pathlib import Path
from flask import Flask, render_template, request, jsonify, redirect, url_for, flash
import git

# 添加项目根目录到路径
sys.path.append(str(Path(__file__).parent.parent.parent))

from blog_writer import HexoBlogWriter

app = Flask(__name__)
app.secret_key = 'your-secret-key-here'  # 用于flash消息

# 全局博客管理器
blog_writer = None

# 全局服务器进程跟踪
hexo_server_processes = {}

def init_blog_writer():
    """初始化博客管理器"""
    global blog_writer
    try:
        # 使用绝对路径，从web目录向上3级到项目根目录
        # __file__ 是 /path/to/blog_tools/web/app.py
        current_path = Path(__file__).resolve()
        blog_path = current_path.parent.parent.parent
        print(f"尝试博客路径: {blog_path}")
        print(f"博客路径存在: {blog_path.exists()}")
        print(f"文章目录存在: {(blog_path / 'source' / '_posts').exists()}")

        # 切换工作目录到博客根目录，确保Git操作正确
        original_cwd = os.getcwd()
        os.chdir(str(blog_path))

        blog_writer = HexoBlogWriter(str(blog_path))

        # 恢复原始工作目录
        os.chdir(original_cwd)

        return True
    except Exception as e:
        print(f"初始化博客管理器失败: {e}")
        print(f"当前文件路径: {__file__}")
        print(f"尝试路径: {Path(__file__).parent.parent.parent}")
        return False

@app.route('/')
def index():
    """主页 - 显示文章列表"""
    try:
        posts = blog_writer.list_posts(limit=50)
        return render_template('index.html', posts=posts)
    except Exception as e:
        flash(f'加载文章失败: {str(e)}', 'error')
        return render_template('index.html', posts=[])

@app.route('/new')
def new_post():
    """新建文章页面"""
    return render_template('new_post.html')

@app.route('/pages')
def pages():
    """页面管理"""
    try:
        pages = blog_writer.list_pages()
        return render_template('pages.html', pages=pages)
    except Exception as e:
        flash(f'加载页面失败: {str(e)}', 'error')
        return render_template('pages.html', pages=[])

@app.route('/new_page')
def new_page():
    """新建页面页面"""
    return render_template('new_page.html')

@app.route('/create_page', methods=['POST'])
def create_page():
    """创建新页面"""
    try:
        title = request.form.get('title', '').strip()
        layout = request.form.get('layout', 'page').strip()
        content = request.form.get('content', '').strip()

        if not title:
            flash('页面标题不能为空', 'error')
            return redirect(url_for('new_page'))

        # 创建页面
        file_path = blog_writer.create_page(title, layout)

        # 如果有内容，写入文件
        if content:
            page_info = blog_writer.get_page_info(title.lower().replace(' ', '-'))
            page_file = blog_writer.pages_dir / title.lower().replace(' ', '-') / 'index.md'

            with open(page_file, 'r', encoding='utf-8') as f:
                file_content = f.read()

            # 在front matter后插入内容
            front_matter_end = file_content.find('\n\n')
            if front_matter_end != -1:
                new_content = file_content[:front_matter_end + 2] + content + '\n\n' + file_content[front_matter_end + 2:]
            else:
                new_content = file_content + '\n\n' + content

            with open(page_file, 'w', encoding='utf-8') as f:
                f.write(new_content)

        flash(f'页面 "{title}" 创建成功！', 'success')
        return redirect(url_for('pages'))

    except Exception as e:
        flash(f'创建页面失败: {str(e)}', 'error')
        return redirect(url_for('new_page'))

@app.route('/edit_page/<page_slug>')
def edit_page(page_slug):
    """编辑页面"""
    try:
        page_info = blog_writer.get_page_info(page_slug)
        page_file = blog_writer.pages_dir / page_slug / 'index.md'

        with open(page_file, 'r', encoding='utf-8') as f:
            content = f.read()

        return render_template('edit_page.html', page=page_info, content=content)

    except Exception as e:
        flash(f'加载页面失败: {str(e)}', 'error')
        return redirect(url_for('pages'))

@app.route('/update_page/<page_slug>', methods=['POST'])
def update_page(page_slug):
    """更新页面"""
    try:
        title = request.form.get('title', '').strip()
        layout = request.form.get('layout', 'page').strip()
        content = request.form.get('content', '').strip()

        success = blog_writer.update_page(page_slug, title, layout, content)

        if success:
            flash(f'页面 "{title}" 更新成功！', 'success')
            return redirect(url_for('pages'))
        else:
            flash(f'更新页面失败', 'error')
            return redirect(url_for('edit_page', page_slug=page_slug))

    except Exception as e:
        flash(f'更新页面失败: {str(e)}', 'error')
        return redirect(url_for('edit_page', page_slug=page_slug))

@app.route('/delete_page/<page_slug>', methods=['POST'])
def delete_page(page_slug):
    """删除页面"""
    try:
        # 获取页面标题用于显示
        page_info = blog_writer.get_page_info(page_slug)
        title = page_info.get('title', page_slug)

        # 删除页面
        success = blog_writer.delete_page(page_slug)

        if success:
            flash(f'页面 "{title}" 已删除！', 'success')
        else:
            flash(f'删除页面失败', 'error')

        return redirect(url_for('pages'))

    except Exception as e:
        flash(f'删除页面失败: {str(e)}', 'error')
        return redirect(url_for('pages'))

@app.route('/create', methods=['POST'])
def create_post():
    """创建新文章"""
    try:
        title = request.form.get('title', '').strip()
        tags = request.form.get('tags', '').strip().split(',')
        tags = [tag.strip() for tag in tags if tag.strip()]
        categories = request.form.get('categories', '').strip().split(',')
        categories = [cat.strip() for cat in categories if cat.strip()]
        content = request.form.get('content', '').strip()

        if not title:
            flash('标题不能为空', 'error')
            return redirect(url_for('new_post'))

        # 创建文章
        file_path = blog_writer.create_post(title, tags, categories)

        # 如果有内容，写入文件
        if content:
            post_path = Path(file_path)
            with open(post_path, 'r', encoding='utf-8') as f:
                file_content = f.read()

            # 在front matter后插入内容
            front_matter_end = file_content.find('\n\n')
            if front_matter_end != -1:
                new_content = file_content[:front_matter_end + 2] + content + '\n\n' + file_content[front_matter_end + 2:]
            else:
                new_content = file_content + '\n\n' + content

            with open(post_path, 'w', encoding='utf-8') as f:
                f.write(new_content)

        flash(f'文章 "{title}" 创建成功！', 'success')
        return redirect(url_for('index'))

    except Exception as e:
        flash(f'创建文章失败: {str(e)}', 'error')
        return redirect(url_for('new_post'))

@app.route('/edit/<filename>')
def edit_post(filename):
    """编辑文章页面"""
    try:
        file_path = blog_writer.posts_dir / filename
        if not file_path.exists():
            flash('文章不存在', 'error')
            return redirect(url_for('index'))

        with open(file_path, 'r', encoding='utf-8') as f:
            full_content = f.read()

        post_info = blog_writer._parse_post_info(file_path)

        # 分离 front matter 和正文内容
        import re
        front_matter_pattern = r'^---\n(.*?)\n---\n(.*)$'
        match = re.match(front_matter_pattern, full_content, re.DOTALL)

        if match:
            # 只提取正文内容，不包括 front matter
            body_content = match.group(2).strip()
        else:
            # 如果没有 front matter，使用完整内容
            body_content = full_content

        return render_template('edit_post.html', post=post_info, content=body_content)

    except Exception as e:
        flash(f'加载文章失败: {str(e)}', 'error')
        return redirect(url_for('index'))

@app.route('/update/<filename>', methods=['POST'])
def update_post(filename):
    """更新文章"""
    try:
        file_path = blog_writer.posts_dir / filename

        # 获取表单数据
        title = request.form.get('title', '').strip()
        date = request.form.get('date', '').strip()
        layout = request.form.get('layout', 'post').strip()
        tags_str = request.form.get('tags', '').strip()
        categories_str = request.form.get('categories', '').strip()
        content = request.form.get('content', '').strip()

        # 处理标签和分类
        tags = [tag.strip() for tag in tags_str.split(',') if tag.strip()] if tags_str else []
        categories = [cat.strip() for cat in categories_str.split(',') if cat.strip()] if categories_str else []

        # 读取现有文件内容
        with open(file_path, 'r', encoding='utf-8') as f:
            full_content = f.read()

        # 分离 front matter 和正文内容
        import re
        front_matter_pattern = r'^---\n(.*?)\n---\n(.*)$'
        match = re.match(front_matter_pattern, full_content, re.DOTALL)

        # 构建新的front matter
        tags_array = ', '.join([f"'{tag}'" for tag in tags]) if tags else ''
        categories_array = ', '.join([f"'{cat}'" for cat in categories]) if categories else ''

        new_front_matter = f"""---
title: {title}
date: {date}
tags: [{tags_array}]
categories: [{categories_array}]
layout: {layout}
---

"""

        # 写入新内容 - 只使用表单中的内容，不保留任何原有内容
        new_content = new_front_matter + content + '\n'

        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)

        flash(f'文章 "{title}" 更新成功！', 'success')
        return redirect(url_for('index'))

    except Exception as e:
        flash(f'更新文章失败: {str(e)}', 'error')
        return redirect(url_for('edit_post', filename=filename))

@app.route('/delete/<filename>', methods=['POST'])
def delete_post(filename):
    """删除文章"""
    try:
        file_path = blog_writer.posts_dir / filename

        if not file_path.exists():
            flash('文章不存在', 'error')
            return redirect(url_for('index'))

        # 获取文章标题用于显示
        post_info = blog_writer._parse_post_info(file_path)
        title = post_info.get('title', filename)

        # 删除文件
        file_path.unlink()

        flash(f'文章 "{title}" 已删除！', 'success')
        return redirect(url_for('index'))

    except Exception as e:
        flash(f'删除文章失败: {str(e)}', 'error')
        return redirect(url_for('edit_post', filename=filename))

@app.route('/preview')
def preview():
    """预览博客"""
    return render_template('preview.html')

@app.route('/debug')
def debug():
    """调试页面"""
    try:
        # 生成静态文件
        blog_writer.generate_site()
        flash('博客生成成功！', 'success')
        return render_template('debug.html')
    except Exception as e:
        flash(f'生成失败: {str(e)}', 'error')
        return render_template('debug.html')

@app.route('/git_status')
def git_status():
    """Git状态"""
    try:
        if blog_writer and blog_writer.repo:
            status = blog_writer.git_status()
            return jsonify(status)
        else:
            return jsonify({'error': '博客管理器未初始化'})
    except Exception as e:
        return jsonify({'error': str(e)})

@app.route('/git_commit', methods=['POST'])
def git_commit():
    """Git提交"""
    try:
        if not blog_writer or not blog_writer.repo:
            return jsonify({'success': False, 'error': '博客仓库未初始化'})

        repo = blog_writer.repo
        message = request.json.get('message', '更新博客')

        # 添加所有文件
        repo.git.add('--all')

        # 检查是否有需要提交的内容
        if repo.is_dirty(untracked_files=True):
            repo.index.commit(message)
            flash('提交成功！', 'success')
        else:
            flash('没有需要提交的更改', 'info')

        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/git_push', methods=['POST'])
def git_push():
    """Git推送"""
    try:
        if not blog_writer or not blog_writer.repo:
            return jsonify({'success': False, 'error': '博客仓库未初始化'})

        repo = blog_writer.repo
        origin = repo.remote(name='origin')

        # 推送到远程
        origin.push()

        flash('推送成功！博客将在几分钟后部署完成。', 'success')
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/posts')
def api_posts():
    """API: 获取文章列表"""
    try:
        posts = blog_writer.list_posts(limit=100)
        return jsonify(posts)
    except Exception as e:
        return jsonify({'error': str(e)})

@app.route('/api/search')
def api_search():
    """API: 搜索文章"""
    keyword = request.args.get('q', '')
    if not keyword:
        return jsonify({'error': '搜索关键词不能为空'})

    try:
        results = blog_writer.search_posts(keyword)
        return jsonify(results)
    except Exception as e:
        return jsonify({'error': str(e)})

@app.route('/api/server_status')
def api_server_status():
    """API: 检查本地服务器状态"""
    import psutil
    import socket

    # 检查端口4000是否被占用
    port_4000_in_use = False
    our_server_running = False

    try:
        # 检查端口4000是否被占用
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.settimeout(1)
            result = s.connect_ex(('localhost', 4000))
            port_4000_in_use = (result == 0)

        # 检查是否是我们启动的服务器
        for port, process_info in hexo_server_processes.items():
            process = process_info['process']
            if process and process.poll() is None:  # 进程还在运行
                if port == 4000:
                    our_server_running = True
                    break
            else:
                # 清理已结束的进程
                del hexo_server_processes[port]

    except Exception as e:
        print(f"检查服务器状态时出错: {e}")

    if our_server_running:
        return jsonify({
            'status': 'running',
            'port': 4000,
            'managed_by_us': True,
            'message': 'Hexo服务器正在运行（由本工具启动）'
        })
    elif port_4000_in_use:
        return jsonify({
            'status': 'running',
            'port': 4000,
            'managed_by_us': False,
            'message': '端口4000被占用，但不是由本工具启动的服务器'
        })
    else:
        return jsonify({
            'status': 'stopped',
            'port': 4000,
            'managed_by_us': False,
            'message': 'Hexo服务器未运行'
        })

@app.route('/api/server_start', methods=['POST'])
def api_server_start():
    """API: 启动Hexo服务器"""
    try:
        data = request.get_json()
        port = data.get('port', 4000)

        # 检查端口是否已被我们的服务器占用
        if port in hexo_server_processes:
            process_info = hexo_server_processes[port]
            process = process_info['process']
            if process and process.poll() is None:
                return jsonify({
                    'success': False,
                    'error': f'端口 {port} 上的服务器已经在运行'
                })

        # 启动Hexo服务器
        import subprocess

        # 生成静态文件
        generate_result = subprocess.run(['npx', 'hexo', 'generate'],
                                      capture_output=True, text=True,
                                      cwd=blog_writer.blog_path)

        if generate_result.returncode != 0:
            return jsonify({
                'success': False,
                'error': f'生成静态文件失败: {generate_result.stderr}'
            })

        # 启动服务器
        process = subprocess.Popen(['npx', 'hexo', 'server', '-p', str(port)],
                                 cwd=blog_writer.blog_path,
                                 stdout=subprocess.PIPE,
                                 stderr=subprocess.PIPE)

        # 记录进程信息
        hexo_server_processes[port] = {
            'process': process,
            'start_time': datetime.datetime.now().isoformat(),
            'port': port
        }

        return jsonify({
            'success': True,
            'message': f'Hexo服务器已启动，端口: {port}',
            'port': port
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        })

@app.route('/api/server_stop', methods=['POST'])
def api_server_stop():
    """API: 停止Hexo服务器"""
    try:
        data = request.get_json()
        port = data.get('port', 4000)

        if port in hexo_server_processes:
            process_info = hexo_server_processes[port]
            process = process_info['process']

            if process and process.poll() is None:
                # 尝试优雅地停止进程
                process.terminate()

                # 等待进程结束
                try:
                    process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    # 如果进程没有优雅结束，强制杀死
                    process.kill()
                    process.wait()

                del hexo_server_processes[port]

                return jsonify({
                    'success': True,
                    'message': f'端口 {port} 上的Hexo服务器已停止'
                })
            else:
                del hexo_server_processes[port]
                return jsonify({
                    'success': False,
                    'error': f'端口 {port} 上的服务器未在运行'
                })
        else:
            return jsonify({
                'success': False,
                'error': f'端口 {port} 上的服务器不是由本工具启动的'
            })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        })

@app.route('/api/project_info')
def api_project_info():
    """API: 获取项目信息"""
    try:
        # 获取 Hexo 版本信息
        result = subprocess.run(['npx', 'hexo', 'version'],
                              capture_output=True, text=True,
                              cwd=blog_writer.blog_path)
        hexo_version = result.stdout.split('\n')[0] if result.returncode == 0 else 'Unknown'

        # 获取 Node.js 版本
        result = subprocess.run(['node', '--version'],
                              capture_output=True, text=True)
        node_version = result.stdout.strip() if result.returncode == 0 else 'Unknown'

        # 获取文章数量
        posts = blog_writer.list_posts(limit=1000)

        # 读取主题配置
        theme = 'Unknown'
        config_file = blog_writer.blog_path / '_config.yml'
        if config_file.exists():
            with open(config_file, 'r', encoding='utf-8') as f:
                content = f.read()
                for line in content.split('\n'):
                    if line.strip().startswith('theme:'):
                        theme = line.split(':')[1].strip()
                        break

        return jsonify({
            'hexo_version': hexo_version.replace('hexo-cli: ', ''),
            'node_version': node_version,
            'post_count': len(posts),
            'theme': theme
        })
    except Exception as e:
        return jsonify({'error': str(e)})

@app.route('/api/execute', methods=['POST'])
def api_execute_command():
    """API: 执行Hexo命令"""
    try:
        data = request.get_json()
        command = data.get('command', '')

        if not command:
            return jsonify({'success': False, 'error': '命令不能为空'})

        # 执行命令
        result = subprocess.run(['npx', 'hexo', command],
                              capture_output=True, text=True,
                              cwd=blog_writer.blog_path)

        if result.returncode == 0:
            return jsonify({
                'success': True,
                'output': result.stdout
            })
        else:
            return jsonify({
                'success': False,
                'error': result.stderr or result.stdout
            })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/git_pull', methods=['POST'])
def git_pull():
    """Git拉取"""
    try:
        repo = git.Repo(blog_writer.blog_path)
        origin = repo.remote(name='origin')
        origin.pull()
        flash('拉取成功！', 'success')
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

if __name__ == '__main__':
    if not init_blog_writer():
        print("无法初始化博客管理器")
        sys.exit(1)

    app.run(host='127.0.0.1', port=5000, debug=True)