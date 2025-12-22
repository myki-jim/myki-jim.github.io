#!/bin/bash

# Hexo 博客写作工具启动脚本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 显示logo
show_logo() {
    echo -e "${CYAN}"
    echo "██╗████████╗████████╗██████╗         ██████╗ ██╗   ██╗"
    echo "██║╚══██╔══╝╚══██╔══╝██╔══██╗        ██╔═══██╗██║   ██║"
    echo "██║   ██║      ██║   ██████╔╝        ██║   ██║██║   ██║"
    echo "██║   ██║      ██║   ██╔══██╗        ██║   ██║╚██╗ ██╔╝"
    echo "██║   ██║      ██║   ██║  ██║███████╗╚██████╔╝ ╚████╔╝ "
    echo "╚═╝   ╚═╝      ╚═╝   ╚═╝  ╚═╝╚══════╝ ╚═════╝   ╚═══╝  "
    echo -e "${NC}"
    echo -e "${PURPLE}博客写作工具 - 增强版${NC}"
    echo -e "${BLUE}===========================================${NC}"
    echo
}

# 检查依赖
check_dependencies() {
    echo -e "${YELLOW}检查依赖...${NC}"

    # 检查 Node.js
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js 未安装${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Node.js: $(node --version)${NC}"

    # 检查 npm
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm 未安装${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ npm: $(npm --version)${NC}"

    # 检查 Python
    if ! command -v python3 &> /dev/null; then
        echo -e "${RED}❌ Python3 未安装${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Python: $(python3 --version)${NC}"

    # 检查 Hexo CLI
    if ! command -v hexo &> /dev/null; then
        echo -e "${YELLOW}⚠️  Hexo CLI 未安装，正在安装...${NC}"
        npm install -g hexo-cli
    else
        echo -e "${GREEN}✅ Hexo CLI: $(hexo version | head -1)${NC}"
    fi

    echo
}

# 安装项目依赖
install_dependencies() {
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}安装项目依赖...${NC}"
        npm install
    fi

    # 检查 Python 依赖
    if ! python3 -c "import flask" &> /dev/null; then
        echo -e "${YELLOW}安装 Flask...${NC}"
        pip3 install flask GitPython
    fi

    # 检查 GitPython
    if ! python3 -c "import git" &> /dev/null; then
        echo -e "${YELLOW}安装 GitPython...${NC}"
        pip3 install GitPython
    fi

    echo
}

# 显示菜单
show_menu() {
    echo -e "${BLUE}请选择操作:${NC}"
    echo "1. 🚀 启动 Web 界面"
    echo "2. 📝 使用命令行工具"
    echo "3. 🌐 启动 Hexo 服务器"
    echo "4. 🔧 调试工具"
    echo "5. 📊 博客统计"
    echo "6. 💾 备份博客"
    echo "7. 🔄 Git 状态检查"
    echo "8. ⚡ 一键提交并推送"
    echo "9. 🔍 检查链接"
    echo "10. ✅ 验证文章格式"
    echo "11. 🆘 帮助"
    echo "12. ❌ 退出"
    echo
    read -p "请输入选项 [1-12]: " choice
    echo
}

# 启动 Web 界面
start_web_interface() {
    echo -e "${YELLOW}启动 Web 界面...${NC}"
    python3 blog_writer.py web
}

# 命令行工具菜单
cli_menu() {
    while true; do
        echo -e "${BLUE}命令行工具菜单:${NC}"
        echo "1. 📝 创建新文章"
        echo "2. 📋 列出文章"
        echo "3. 🔍 搜索文章"
        echo "4. 🌐 启动服务器"
        echo "5. 🔨 生成静态文件"
        echo "6. 🚀 部署网站"
        echo "7. ⬅️  返回主菜单"
        echo
        read -p "请选择操作 [1-7]: " cli_choice
        echo

        case $cli_choice in
            1)
                read -p "文章标题: " title
                read -p "标签 (用空格分隔): " tags
                read -p "分类 (用空格分隔): " categories

                if [ -n "$tags" ]; then
                    tags_array="--tags ${tags// / --tags }"
                else
                    tags_array=""
                fi

                if [ -n "$categories" ]; then
                    categories_array="--categories ${categories// / --categories }"
                else
                    categories_array=""
                fi

                python3 blog_writer.py new "$title" $tags_array $categories_array
                ;;
            2)
                read -p "显示数量 (默认10): " limit
                if [ -z "$limit" ]; then
                    limit=10
                fi
                python3 blog_writer.py list --limit $limit
                ;;
            3)
                read -p "搜索关键词: " keyword
                python3 blog_writer.py search "$keyword"
                ;;
            4)
                read -p "端口号 (默认4000): " port
                if [ -z "$port" ]; then
                    port=4000
                fi
                python3 blog_writer.py serve --port $port
                ;;
            5)
                python3 blog_writer.py generate
                ;;
            6)
                python3 blog_writer.py deploy
                ;;
            7)
                break
                ;;
            *)
                echo -e "${RED}无效选项${NC}"
                ;;
        esac
        echo
    done
}

# 调试工具菜单
debug_menu() {
    echo -e "${BLUE}调试工具:${NC}"
    echo "1. 🔍 检查链接"
    echo "2. ✅ 验证文章格式"
    echo "3. 📊 显示统计信息"
    echo
    read -p "请选择调试工具 [1-3]: " debug_choice
    echo

    case $debug_choice in
        1)
            python3 blog_writer.py debug links
            ;;
        2)
            python3 blog_writer.py debug validate
            ;;
        3)
            python3 blog_writer.py debug stats
            ;;
        *)
            echo -e "${RED}无效选项${NC}"
            ;;
    esac
}

# Git 菜单
git_menu() {
    while true; do
        echo -e "${BLUE}Git 操作:${NC}"
        echo "1. 📋 查看状态"
        echo "2. 📝 提交更改"
        echo "3. 🚀 推送到远程"
        echo "4. 📥 拉取更改"
        echo "5. ⬅️  返回主菜单"
        echo
        read -p "请选择 Git 操作 [1-5]: " git_choice
        echo

        case $git_choice in
            1)
                python3 blog_writer.py git status
                ;;
            2)
                python3 blog_writer.py git commit
                ;;
            3)
                python3 blog_writer.py git push
                ;;
            4)
                python3 blog_writer.py git pull
                ;;
            5)
                break
                ;;
            *)
                echo -e "${RED}无效选项${NC}"
                ;;
        esac
        echo
    done
}

# 一键提交并推送
quick_commit_push() {
    echo -e "${YELLOW}执行一键提交并推送...${NC}"

    # 检查状态
    python3 blog_writer.py git status

    echo
    read -p "确认提交并推送? (y/N): " confirm
    if [[ $confirm =~ ^[Yy]$ ]]; then
        # 提交
        python3 blog_writer.py git commit

        # 推送
        python3 blog_writer.py git push

        echo -e "${GREEN}✅ 一键提交并推送完成！${NC}"
        echo -e "${CYAN}博客将在几分钟后部署完成。${NC}"
    else
        echo -e "${YELLOW}操作已取消${NC}"
    fi
}

# 显示帮助
show_help() {
    echo -e "${BLUE}Hexo 博客写作工具帮助${NC}"
    echo
    echo -e "${YELLOW}命令行工具:${NC}"
    echo "  python3 blog_writer.py new '标题'           # 创建新文章"
    echo "  python3 blog_writer.py list                 # 列出文章"
    echo "  python3 blog_writer.py search '关键词'       # 搜索文章"
    echo "  python3 blog_writer.py serve                # 启动服务器"
    echo "  python3 blog_writer.py generate             # 生成静态文件"
    echo "  python3 blog_writer.py deploy               # 部署网站"
    echo
    echo -e "${YELLOW}Git 操作:${NC}"
    echo "  python3 blog_writer.py git status           # 查看状态"
    echo "  python3 blog_writer.py git commit           # 提交更改"
    echo "  python3 blog_writer.py git push             # 推送到远程"
    echo "  python3 blog_writer.py git pull             # 拉取更改"
    echo
    echo -e "${YELLOW}调试工具:${NC}"
    echo "  python3 blog_writer.py debug links          # 检查链接"
    echo "  python3 blog_writer.py debug validate       # 验证文章格式"
    echo "  python3 blog_writer.py debug stats          # 显示统计信息"
    echo
    echo -e "${YELLOW}其他功能:${NC}"
    echo "  python3 blog_writer.py backup               # 备份博客"
    echo "  python3 blog_writer.py web                  # 启动Web界面"
    echo
    echo -e "${YELLOW}Hexo 命令:${NC}"
    echo "  npx hexo server                            # 启动开发服务器"
    echo "  npx hexo generate                         # 生成静态文件"
    echo "  npx hexo deploy                           # 部署到远程"
    echo
}

# 主程序
main() {
    show_logo
    check_dependencies
    install_dependencies

    while true; do
        show_menu

        case $choice in
            1)
                start_web_interface
                ;;
            2)
                cli_menu
                ;;
            3)
                read -p "端口号 (默认4000): " port
                if [ -z "$port" ]; then
                    port=4000
                fi
                npx hexo server --port $port
                ;;
            4)
                debug_menu
                ;;
            5)
                python3 blog_writer.py debug stats
                ;;
            6)
                read -p "备份目录 (留空自动生成): " backup_dir
                if [ -n "$backup_dir" ]; then
                    python3 blog_writer.py backup --dir "$backup_dir"
                else
                    python3 blog_writer.py backup
                fi
                ;;
            7)
                python3 blog_writer.py git status
                ;;
            8)
                quick_commit_push
                ;;
            9)
                python3 blog_writer.py debug links
                ;;
            10)
                python3 blog_writer.py debug validate
                ;;
            11)
                show_help
                ;;
            12)
                echo -e "${GREEN}👋 再见！${NC}"
                exit 0
                ;;
            *)
                echo -e "${RED}❌ 无效选项，请重新选择${NC}"
                ;;
        esac
        echo
    done
}

# 捕获中断信号
trap 'echo -e "\n${YELLOW}操作已中断${NC}"; exit 1' INT

# 运行主程序
main