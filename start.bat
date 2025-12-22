@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

:: Hexo 博客写作工具启动脚本 (Windows)

title Hexo 博客写作工具

:: 显示logo
echo.
echo ██╗████████╗████████╗██████╗         ██████╗ ██╗   ██╗
echo ██║╚══██╔══╝╚══██╔══╝██╔══██╗        ██╔═══██╗██║   ██║
echo ██║   ██║      ██║   ██████╔╝        ██║   ██║██║   ██║
echo ██║   ██║      ██║   ██╔══██╗        ██║   ██║╚██╗ ██╔╝
echo ██║   ██║      ██║   ██║  ██║███████╗╚██████╔╝ ╚████╔╝
echo ╚═╝   ╚═╝      ╚═╝   ╚═╝  ╚═╝╚══════╝ ╚═════╝   ╚═══╝
echo.
echo 博客写作工具 - 增强版
echo ===========================================
echo.

:: 检查依赖
echo [黄色]检查依赖...[颜色重置]

:: 检查 Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [红色]❌ Node.js 未安装[颜色重置]
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set node_version=%%i
echo [绿色]✅ Node.js: %node_version%[颜色重置]

:: 检查 npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [红色]❌ npm 未安装[颜色重置]
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('npm --version') do set npm_version=%%i
echo [绿色]✅ npm: %npm_version%[颜色重置]

:: 检查 Python
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [红色]❌ Python 未安装[颜色重置]
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('python --version 2^>^&1') do set python_version=%%i
echo [绿色]✅ Python: %python_version%[颜色重置]

:: 检查 Hexo CLI
where hexo >nul 2>nul
if %errorlevel% neq 0 (
    echo [黄色]⚠️  Hexo CLI 未安装，正在安装...[颜色重置]
    npm install -g hexo-cli
) else (
    echo [绿色]✅ Hexo CLI 已安装[颜色重置]
)

echo.

:: 安装项目依赖
if not exist node_modules (
    echo [黄色]安装项目依赖...[颜色重置]
    npm install
)

:: 检查 Python 依赖
python -c "import flask" >nul 2>nul
if %errorlevel% neq 0 (
    echo [黄色]安装 Flask...[颜色重置]
    pip install flask GitPython
)

python -c "import git" >nul 2>nul
if %errorlevel% neq 0 (
    echo [黄色]安装 GitPython...[颜色重置]
    pip install GitPython
)

echo.

:main_menu
:: 显示菜单
echo [蓝色]请选择操作:[颜色重置]
echo 1. 🚀 启动 Web 界面
echo 2. 📝 使用命令行工具
echo 3. 🌐 启动 Hexo 服务器
echo 4. 🔧 调试工具
echo 5. 📊 博客统计
echo 6. 💾 备份博客
echo 7. 🔄 Git 状态检查
echo 8. ⚡ 一键提交并推送
echo 9. 🔍 检查链接
echo 10. ✅ 验证文章格式
echo 11. 🆘 帮助
echo 12. ❌ 退出
echo.
set /p choice="请输入选项 [1-12]: "
echo.

if "%choice%"=="1" goto start_web
if "%choice%"=="2" goto cli_menu
if "%choice%"=="3" goto start_hexo
if "%choice%"=="4" goto debug_menu
if "%choice%"=="5" goto show_stats
if "%choice%"=="6" goto backup_blog
if "%choice%"=="7" goto git_status
if "%choice%"=="8" goto quick_commit_push
if "%choice%"=="9" goto check_links
if "%choice%"=="10" goto validate_posts
if "%choice%"=="11" goto show_help
if "%choice%"=="12" goto exit_program

echo [红色]❌ 无效选项[颜色重置]
echo.
goto main_menu

:start_web
echo [黄色]启动 Web 界面...[颜色重置]
python blog_writer.py web
goto main_menu

:cli_menu
:cli_loop
echo [蓝色]命令行工具菜单:[颜色重置]
echo 1. 📝 创建新文章
echo 2. 📋 列出文章
echo 3. 🔍 搜索文章
echo 4. 🌐 启动服务器
echo 5. 🔨 生成静态文件
echo 6. 🚀 部署网站
echo 7. ⬅️  返回主菜单
echo.
set /p cli_choice="请选择操作 [1-7]: "
echo.

if "%cli_choice%"=="1" goto create_post
if "%cli_choice%"=="2" goto list_posts
if "%cli_choice%"=="3" goto search_posts
if "%cli_choice%"=="4" goto serve_posts
if "%cli_choice%"=="5" goto generate_posts
if "%cli_choice%"=="6" goto deploy_posts
if "%cli_choice%"=="7" goto main_menu

echo [红色]无效选项[颜色重置]
echo.
goto cli_loop

:create_post
set /p title="文章标题: "
set /p tags="标签 (用空格分隔): "
set /p categories="分类 (用空格分隔): "

set "cmd=python blog_writer.py new "%title%""
if not "%tags%"=="" (
    for %%a in (%tags%) do set "cmd=!cmd! --tags %%a"
)
if not "%categories%"=="" (
    for %%a in (%categories%) do set "cmd=!cmd! --categories %%a"
)

%cmd%
echo.
goto cli_loop

:list_posts
set /p limit="显示数量 (默认10): "
if "%limit%"=="" set limit=10
python blog_writer.py list --limit %limit%
echo.
goto cli_loop

:search_posts
set /p keyword="搜索关键词: "
python blog_writer.py search "%keyword%"
echo.
goto cli_loop

:serve_posts
set /p port="端口号 (默认4000): "
if "%port%"=="" set port=4000
python blog_writer.py serve --port %port%
echo.
goto cli_loop

:generate_posts
python blog_writer.py generate
echo.
goto cli_loop

:deploy_posts
python blog_writer.py deploy
echo.
goto cli_loop

:start_hexo
set /p port="端口号 (默认4000): "
if "%port%"=="" set port=4000
npx hexo server --port %port%
goto main_menu

:debug_menu
echo [蓝色]调试工具:[颜色重置]
echo 1. 🔍 检查链接
echo 2. ✅ 验证文章格式
echo 3. 📊 显示统计信息
echo.
set /p debug_choice="请选择调试工具 [1-3]: "
echo.

if "%debug_choice%"=="1" python blog_writer.py debug links
if "%debug_choice%"=="2" python blog_writer.py debug validate
if "%debug_choice%"=="3" python blog_writer.py debug stats

echo.
goto main_menu

:show_stats
python blog_writer.py debug stats
echo.
goto main_menu

:backup_blog
set /p backup_dir="备份目录 (留空自动生成): "
if "%backup_dir%"=="" (
    python blog_writer.py backup
) else (
    python blog_writer.py backup --dir "%backup_dir%"
)
echo.
goto main_menu

:git_status
python blog_writer.py git status
echo.
goto main_menu

:quick_commit_push
echo [黄色]执行一键提交并推送...[颜色重置]

python blog_writer.py git status

echo.
set /p confirm="确认提交并推送? (y/N): "
if /i "%confirm%"=="y" (
    python blog_writer.py git commit
    python blog_writer.py git push
    echo [绿色]✅ 一键提交并推送完成！[颜色重置]
    echo [青色]博客将在几分钟后部署完成。[颜色重置]
) else (
    echo [黄色]操作已取消[颜色重置]
)
echo.
goto main_menu

:check_links
python blog_writer.py debug links
echo.
goto main_menu

:validate_posts
python blog_writer.py debug validate
echo.
goto main_menu

:show_help
echo [蓝色]Hexo 博客写作工具帮助[颜色重置]
echo.
echo [黄色]命令行工具:[颜色重置]
echo   python blog_writer.py new '标题'           # 创建新文章
echo   python blog_writer.py list                 # 列出文章
echo   python blog_writer.py search '关键词'       # 搜索文章
echo   python blog_writer.py serve                # 启动服务器
echo   python blog_writer.py generate             # 生成静态文件
echo   python blog_writer.py deploy               # 部署网站
echo.
echo [黄色]Git 操作:[颜色重置]
echo   python blog_writer.py git status           # 查看状态
echo   python blog_writer.py git commit           # 提交更改
echo   python blog_writer.py git push             # 推送到远程
echo   python blog_writer.py git pull             # 拉取更改
echo.
echo [黄色]调试工具:[颜色重置]
echo   python blog_writer.py debug links          # 检查链接
echo   python blog_writer.py debug validate       # 验证文章格式
echo   python blog_writer.py debug stats          # 显示统计信息
echo.
echo [黄色]其他功能:[颜色重置]
echo   python blog_writer.py backup               # 备份博客
echo   python blog_writer.py web                  # 启动Web界面
echo.
echo [黄色]Hexo 命令:[颜色重置]
echo   npx hexo server                            # 启动开发服务器
echo   npx hexo generate                         # 生成静态文件
echo   npx hexo deploy                           # 部署到远程
echo.
goto main_menu

:exit_program
echo [绿色]👋 再见！[颜色重置]
pause
exit /b 0