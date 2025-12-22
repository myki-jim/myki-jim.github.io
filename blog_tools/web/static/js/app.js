// Hexo 写作工具 JavaScript

// 全局变量
let isServerRunning = false;
let autoSaveInterval = null;
let lastSaveTime = null;

// DOM 加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// 初始化应用
function initializeApp() {
    // 检查服务器状态
    checkServerStatus();

    // 初始化Git状态指示器
    initGitStatusIndicator();

    // 初始化提示工具
    initializeTooltips();

    // 设置快捷键
    setupKeyboardShortcuts();

    // 定期检查状态
    setInterval(checkStatus, 30000); // 每30秒检查一次
}

// 检查服务器状态
function checkServerStatus() {
    fetch('/api/server_status')
        .then(response => response.json())
        .then(data => {
            isServerRunning = (data.status === 'running');
            updateServerStatusBadge(isServerRunning);
        })
        .catch(error => {
            console.log('无法检查服务器状态');
            updateServerStatusBadge(false);
        });
}

// 更新服务器状态徽章
function updateServerStatusBadge(data) {
    const badge = document.getElementById('serverStatus');
    if (badge) {
        if (data.status === 'running' && data.managed_by_us) {
            badge.textContent = '运行中（工具）';
            badge.className = 'badge bg-success';
        } else if (data.status === 'running' && !data.managed_by_us) {
            badge.textContent = '运行中（外部）';
            badge.className = 'badge bg-warning';
        } else {
            badge.textContent = '未运行';
            badge.className = 'badge bg-danger';
        }
    }

    // 更新服务器控制按钮
    updateServerControlButtons(data);
}

// 更新服务器控制按钮
function updateServerControlButtons(data) {
    const startButton = document.getElementById('startServerBtn');
    const stopButton = document.getElementById('stopServerBtn');
    const statusMessage = document.getElementById('serverStatusMessage');

    if (startButton && stopButton) {
        if (data.status === 'running' && data.managed_by_us) {
            // 我们启动的服务器 - 显示停止按钮
            startButton.style.display = 'none';
            stopButton.style.display = 'inline-block';
        } else if (data.status === 'running' && !data.managed_by_us) {
            // 外部启动的服务器 - 两个按钮都不显示
            startButton.style.display = 'none';
            stopButton.style.display = 'none';
        } else {
            // 服务器未运行 - 显示启动按钮
            startButton.style.display = 'inline-block';
            stopButton.style.display = 'none';
        }
    }

    if (statusMessage) {
        statusMessage.textContent = data.message;
        statusMessage.className = data.status === 'running' ? 'text-success' : 'text-muted';
    }
}

// 检查Git状态
function checkGitStatus() {
    fetch('/git_status')
        .then(response => response.json())
        .then(data => {
            updateGitStatusIndicator(data);
        })
        .catch(error => {
            console.log('检查Git状态失败');
            updateGitStatusIndicator({ error: true });
        });
}

// 更新Git状态指示器
function updateGitStatusIndicator(data) {
    const gitStatusElement = document.getElementById('gitStatusIndicator');
    if (!gitStatusElement) return;

    if (data.error) {
        gitStatusElement.className = 'git-status-indicator git-error';
        gitStatusElement.title = 'Git状态检查失败';
        gitStatusElement.innerHTML = '<i class="bi bi-exclamation-triangle"></i>';
    } else if (data.is_clean) {
        gitStatusElement.className = 'git-status-indicator git-clean';
        gitStatusElement.title = 'Git状态: 干净 - 点击查看详情';
        gitStatusElement.innerHTML = '<i class="bi bi-check-circle"></i>';
    } else {
        const changesCount =
            (data.modified_files ? data.modified_files.length : 0) +
            (data.untracked_files ? data.untracked_files.length : 0);

        gitStatusElement.className = 'git-status-indicator git-dirty';
        gitStatusElement.title = `Git状态: ${changesCount} 个更改 - 点击查看详情`;
        gitStatusElement.innerHTML = `<i class="bi bi-pencil-square"></i>`;
        if (changesCount > 0) {
            gitStatusElement.innerHTML += `<span class="git-count">${changesCount}</span>`;
        }
    }
}

// 更新Git状态显示内容
function updateGitStatusDisplay(data) {
    const gitStatusInfo = document.getElementById('gitStatusContent');
    if (!gitStatusInfo) return;

    let html = '';

    if (data.error) {
        html = `<div class="alert alert-danger">错误: ${data.error}</div>`;
    } else {
        html = '<div class="git-status-details">';
        html += `<p><strong><i class="bi bi-diagram-2"></i> 分支:</strong> ${data.branch}</p>`;
        html += `<p><strong><i class="bi bi-info-circle"></i> 状态:</strong> ${data.is_clean ? '✅ 干净' : '⚠️ 有更改'}</p>`;

        if (!data.is_clean) {
            html += '<div class="mt-3"><strong><i class="bi bi-file-text"></i> 更改详情:</strong></div>';

            if (data.untracked_files && data.untracked_files.length > 0) {
                html += '<div class="mt-2"><strong>新增文件:</strong><ul class="list-unstyled ms-3">';
                data.untracked_files.forEach(file => {
                    html += `<li class="text-muted small"><i class="bi bi-plus-circle"></i> ${file}</li>`;
                });
                html += '</ul></div>';
            }

            if (data.modified_files && data.modified_files.length > 0) {
                html += '<div class="mt-2"><strong>修改文件:</strong><ul class="list-unstyled ms-3">';
                data.modified_files.forEach(file => {
                    html += `<li class="text-warning small"><i class="bi bi-pencil"></i> ${file}</li>`;
                });
                html += '</ul></div>';
            }

            if (data.staged_files && data.staged_files.length > 0) {
                html += '<div class="mt-2"><strong>已暂存:</strong><ul class="list-unstyled ms-3">';
                data.staged_files.forEach(file => {
                    html += `<li class="text-info small"><i class="bi bi-check-square"></i> ${file}</li>`;
                });
                html += '</ul></div>';
            }
        }

        html += '</div>';
    }

    gitStatusInfo.innerHTML = html;
}

// 快速提交
function quickCommit() {
    const modal = new bootstrap.Modal(document.getElementById('commitModal'));
    modal.show();
}

// 执行提交
function doCommit() {
    const message = document.getElementById('commitMessage').value.trim();

    if (!message) {
        alert('请输入提交信息');
        return;
    }

    fetch('/git_commit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: message })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // 关闭模态框
            const modal = bootstrap.Modal.getInstance(document.getElementById('commitModal'));
            modal.hide();

            // 显示成功消息
            showAlert('提交成功！', 'success');

            // 更新Git状态
            checkGitStatus();
        } else {
            showAlert('提交失败: ' + data.error, 'danger');
        }
    })
    .catch(error => {
        showAlert('提交失败: ' + error, 'danger');
    });
}

// 快速推送
function quickPush() {
    if (!confirm('确定要推送到远程仓库吗？这将部署你的博客。')) {
        return;
    }

    // 显示加载状态
    const pushButton = event.target;
    const originalText = pushButton.innerHTML;
    pushButton.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>推送中...';
    pushButton.disabled = true;

    fetch('/git_push', {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showAlert('推送成功！博客将在几分钟后部署完成。', 'success');
            checkGitStatus();
        } else {
            showAlert('推送失败: ' + data.error, 'danger');
        }
    })
    .catch(error => {
        showAlert('推送失败: ' + error, 'danger');
    })
    .finally(() => {
        // 恢复按钮状态
        pushButton.innerHTML = originalText;
        pushButton.disabled = false;
    });
}

// 显示Git状态模态框
function showGitStatusModal() {
    // 先显示加载状态
    const content = document.getElementById('gitStatusContent');
    content.innerHTML = `
        <div class="text-center">
            <div class="spinner-border spinner-border-sm" role="status">
                <span class="visually-hidden">检查中...</span>
            </div>
            <p class="mt-2">正在检查Git状态...</p>
        </div>
    `;

    // 显示模态框
    const modal = new bootstrap.Modal(document.getElementById('gitStatusModal'));
    modal.show();

    // 获取Git状态
    fetch('/git_status')
        .then(response => response.json())
        .then(data => {
            updateGitStatusDisplay(data);
        })
        .catch(error => {
            console.log('获取Git状态失败');
            content.innerHTML = `
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle"></i>
                    获取Git状态失败: ${error}
                </div>
            `;
        });
}

// 检查Git状态（用于按钮点击）
function checkGitStatus() {
    showGitStatusModal();
}

// 提交更改
function commitChanges() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('gitStatusModal'));
    modal.hide();

    setTimeout(() => {
        quickCommit();
    }, 500);
}

// 显示提示消息
function showAlert(message, type = 'info') {
    // 创建提示元素
    const alert = document.createElement('div');
    alert.className = `alert alert-${alertTypeToBootstrap(type)} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
    alert.style.zIndex = '9999';
    alert.style.minWidth = '300px';
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    document.body.appendChild(alert);

    // 3秒后自动关闭
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 3000);
}

// 转换提示类型
function alertTypeToBootstrap(type) {
    const mapping = {
        'success': 'success',
        'error': 'danger',
        'warning': 'warning',
        'info': 'info'
    };
    return mapping[type] || 'info';
}

// 初始化提示工具
function initializeTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// 设置键盘快捷键
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + S: 保存
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();

            // 如果在编辑页面，提交表单
            const form = document.querySelector('form[method="POST"]');
            if (form) {
                form.submit();
            }
        }

        // Ctrl/Cmd + P: 预览
        if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
            e.preventDefault();

            // 如果在新建或编辑页面，预览内容
            if (document.getElementById('content')) {
                previewInNewWindow();
            }
        }

        // Ctrl/Cmd + G: Git状态
        if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
            e.preventDefault();
            showGitStatusModal();
        }

        // Ctrl/Cmd + Enter: 提交
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            quickCommit();
        }
    });
}

// 检查所有状态
function checkStatus() {
    checkGitStatus();
    checkServerStatus();
}

// 初始化Git状态指示器
function initGitStatusIndicator() {
    fetch('/git_status')
        .then(response => response.json())
        .then(data => {
            updateGitStatusIndicator(data);
        })
        .catch(error => {
            console.log('初始化Git状态失败');
            updateGitStatusIndicator({ error: true });
        });
}

// 复制文本到剪贴板
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showAlert('已复制到剪贴板', 'success');
    }).catch(err => {
        console.error('复制失败:', err);
        showAlert('复制失败', 'error');
    });
}

// 格式化时间
function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// 相对时间
function timeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) {
        return '刚刚';
    } else if (minutes < 60) {
        return `${minutes}分钟前`;
    } else if (hours < 24) {
        return `${hours}小时前`;
    } else if (days < 30) {
        return `${days}天前`;
    } else {
        return formatTime(dateString);
    }
}

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 节流函数
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// 加载指示器
function showLoading(element) {
    element.innerHTML = '<div class="spinner-border spinner-border-sm me-2"></div>加载中...';
    element.disabled = true;
}

function hideLoading(element, originalText) {
    element.innerHTML = originalText;
    element.disabled = false;
}

// 确认对话框
function confirmAction(message, callback) {
    if (confirm(message)) {
        callback();
    }
}

// 滚动到顶部
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// 启动Hexo服务器
function startServer() {
    const startButton = document.getElementById('startServerBtn');
    const originalText = startButton.innerHTML;

    showLoading(startButton);

    fetch('/api/server_start', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ port: 4000 })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showAlert('Hexo服务器启动成功！', 'success');
            // 等待服务器启动后检查状态
            setTimeout(() => {
                checkServerStatus();
            }, 3000);
        } else {
            showAlert('启动失败: ' + data.error, 'danger');
            hideLoading(startButton, originalText);
        }
    })
    .catch(error => {
        showAlert('启动失败: ' + error, 'danger');
        hideLoading(startButton, originalText);
    });
}

// 停止Hexo服务器
function stopServer() {
    if (!confirm('确定要停止Hexo服务器吗？')) {
        return;
    }

    const stopButton = document.getElementById('stopServerBtn');
    const originalText = stopButton.innerHTML;

    showLoading(stopButton);

    fetch('/api/server_stop', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ port: 4000 })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showAlert('Hexo服务器已停止', 'info');
            checkServerStatus();
        } else {
            showAlert('停止失败: ' + data.error, 'danger');
        }
        hideLoading(stopButton, originalText);
    })
    .catch(error => {
        showAlert('停止失败: ' + error, 'danger');
        hideLoading(stopButton, originalText);
    });
}

// 滚动到元素
function scrollToElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// 导出函数供HTML使用
window.checkGitStatus = checkGitStatus;
window.quickCommit = quickCommit;
window.doCommit = doCommit;
window.quickPush = quickPush;
window.commitChanges = commitChanges;
window.copyToClipboard = copyToClipboard;
window.formatTime = formatTime;
window.timeAgo = timeAgo;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.confirmAction = confirmAction;
window.scrollToTop = scrollToTop;
window.scrollToElement = scrollToElement;
window.startServer = startServer;
window.stopServer = stopServer;