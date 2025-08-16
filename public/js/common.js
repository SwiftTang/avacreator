// AVACreator 通用工具函数

// 全局应用状态
window.AVACreator = window.AVACreator || {
    user: null,
    permissions: [],
    config: {
        apiBaseUrl: '/api',
        version: '1.01'
    }
};

// 工具函数集合
const Utils = {
    // 格式化日期
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    // 格式化时间
    formatTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    // 格式化相对时间
    formatRelativeTime(dateString) {
        const now = new Date();
        const date = new Date(dateString);
        const diff = now - date;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) return '刚刚';
        if (minutes < 60) return `${minutes}分钟前`;
        if (hours < 24) return `${hours}小时前`;
        if (days < 7) return `${days}天前`;
        
        return this.formatDate(dateString);
    },

    // 格式化数字
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    },

    // 格式化货币
    formatCurrency(amount) {
        return new Intl.NumberFormat('zh-CN', {
            style: 'currency',
            currency: 'CNY'
        }).format(amount);
    },

    // 防抖函数
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // 节流函数
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // 生成UUID
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },

    // 深拷贝
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (typeof obj === 'object') {
            const clonedObj = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = this.deepClone(obj[key]);
                }
            }
            return clonedObj;
        }
    },

    // 存储工具
    storage: {
        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (e) {
                console.error('存储失败:', e);
                return false;
            }
        },

        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (e) {
                console.error('读取存储失败:', e);
                return defaultValue;
            }
        },

        remove(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (e) {
                console.error('删除存储失败:', e);
                return false;
            }
        },

        clear() {
            try {
                localStorage.clear();
                return true;
            } catch (e) {
                console.error('清空存储失败:', e);
                return false;
            }
        }
    }
};

// API 请求工具
const API = {
    // 基础请求方法
    async request(url, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        // 添加认证token
        const token = Utils.storage.get('authToken');
        if (token) {
            defaultOptions.headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers,
            },
        };

        try {
            const response = await fetch(AVACreator.config.apiBaseUrl + url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API请求失败:', error);
            throw error;
        }
    },

    // GET 请求
    async get(url, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const fullUrl = queryString ? `${url}?${queryString}` : url;
        return this.request(fullUrl);
    },

    // POST 请求
    async post(url, data = {}) {
        return this.request(url, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    // PUT 请求
    async put(url, data = {}) {
        return this.request(url, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    // DELETE 请求
    async delete(url) {
        return this.request(url, {
            method: 'DELETE',
        });
    }
};

// 权限管理
const Permission = {
    // 检查权限
    check(action, resource) {
        const user = AVACreator.user;
        if (!user) return false;

        const permissions = this.getPermissions(user.role);
        
        if (permissions.includes('*')) return true;
        if (permissions.includes(`${action}:${resource}`)) return true;
        if (permissions.includes(`${action}:*`)) return true;
        
        return false;
    },

    // 获取角色权限 - admin用户拥有最高权限
    getPermissions(role) {
        const rolePermissions = {
            admin: ['*'], // 管理员拥有所有权限
            investor: ['read:projects', 'read:products', 'create:ideas', 'update:own_ideas', 'create:projects', 'evaluate:projects', 'rate:*'],
            product_manager: ['read:*', 'create:projects', 'create:tasks', 'review:tasks', 'update:own_projects', 'manage:team', 'approve:tasks'],
            designer: ['read:tasks', 'read:projects', 'update:own_tasks', 'create:designs', 'submit:designs'],
            developer: ['read:tasks', 'read:projects', 'update:own_tasks', 'create:code', 'submit:code']
        };

        return rolePermissions[role] || [];
    },

    // 检查是否为管理员
    isAdmin() {
        return AVACreator.user?.role === 'admin';
    },

    // 检查是否为投资者
    isInvestor() {
        return AVACreator.user?.role === 'investor';
    },

    // 检查是否为产品经理
    isProductManager() {
        return AVACreator.user?.role === 'product_manager';
    },

    // 检查是否为设计师
    isDesigner() {
        return AVACreator.user?.role === 'designer';
    },

    // 检查是否为开发者
    isDeveloper() {
        return AVACreator.user?.role === 'developer';
    }
};

// 通知系统
const Notification = {
    // 显示成功消息
    success(message, duration = 3000) {
        this.show(message, 'success', duration);
    },

    // 显示错误消息
    error(message, duration = 5000) {
        this.show(message, 'error', duration);
    },

    // 显示警告消息
    warning(message, duration = 4000) {
        this.show(message, 'warning', duration);
    },

    // 显示信息消息
    info(message, duration = 3000) {
        this.show(message, 'info', duration);
    },

    // 显示通知
    show(message, type = 'info', duration = 3000) {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${this.getIcon(type)}</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        // 添加样式
        this.addNotificationStyles();

        // 添加到页面
        const container = this.getNotificationContainer();
        container.appendChild(notification);

        // 自动移除
        if (duration > 0) {
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, duration);
        }

        return notification;
    },

    // 获取图标
    getIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    },

    // 获取通知容器
    getNotificationContainer() {
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
        return container;
    },

    // 添加通知样式
    addNotificationStyles() {
        if (document.getElementById('notification-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 10px;
            }

            .notification {
                min-width: 300px;
                max-width: 500px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                backdrop-filter: blur(10px);
                animation: slideIn 0.3s ease-out;
            }

            .notification-success {
                background: linear-gradient(135deg, rgba(82, 196, 26, 0.9), rgba(82, 196, 26, 0.7));
                border: 1px solid rgba(82, 196, 26, 0.5);
            }

            .notification-error {
                background: linear-gradient(135deg, rgba(255, 71, 87, 0.9), rgba(255, 71, 87, 0.7));
                border: 1px solid rgba(255, 71, 87, 0.5);
            }

            .notification-warning {
                background: linear-gradient(135deg, rgba(255, 165, 0, 0.9), rgba(255, 165, 0, 0.7));
                border: 1px solid rgba(255, 165, 0, 0.5);
            }

            .notification-info {
                background: linear-gradient(135deg, rgba(0, 245, 255, 0.9), rgba(0, 245, 255, 0.7));
                border: 1px solid rgba(0, 245, 255, 0.5);
            }

            .notification-content {
                display: flex;
                align-items: center;
                padding: 12px 16px;
                color: white;
            }

            .notification-icon {
                margin-right: 10px;
                font-size: 1.2em;
            }

            .notification-message {
                flex: 1;
                font-size: 14px;
                line-height: 1.4;
            }

            .notification-close {
                background: none;
                border: none;
                color: white;
                font-size: 18px;
                cursor: pointer;
                padding: 0;
                margin-left: 10px;
                opacity: 0.7;
                transition: opacity 0.2s;
            }

            .notification-close:hover {
                opacity: 1;
            }

            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            @media (max-width: 768px) {
                .notification-container {
                    left: 20px;
                    right: 20px;
                    top: 20px;
                }

                .notification {
                    min-width: auto;
                }
            }
        `;
        document.head.appendChild(styles);
    }
};

// 路由管理
const Router = {
    // 导航到指定页面
    navigate(path) {
        window.location.href = path;
    },

    // 获取当前路径
    getCurrentPath() {
        return window.location.pathname;
    },

    // 获取查询参数
    getQueryParams() {
        const params = new URLSearchParams(window.location.search);
        const result = {};
        for (const [key, value] of params) {
            result[key] = value;
        }
        return result;
    },

    // 设置查询参数
    setQueryParam(key, value) {
        const url = new URL(window.location);
        url.searchParams.set(key, value);
        window.history.pushState({}, '', url);
    },

    // 移除查询参数
    removeQueryParam(key) {
        const url = new URL(window.location);
        url.searchParams.delete(key);
        window.history.pushState({}, '', url);
    }
};

// 表单验证
const Validator = {
    // 验证邮箱
    email(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },

    // 验证手机号
    phone(phone) {
        const regex = /^1[3-9]\d{9}$/;
        return regex.test(phone);
    },

    // 验证密码强度
    password(password) {
        // 至少6位，包含字母和数字
        const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;
        return regex.test(password);
    },

    // 验证用户名
    username(username) {
        // 3-20位，字母数字下划线
        const regex = /^[a-zA-Z0-9_]{3,20}$/;
        return regex.test(username);
    },

    // 验证必填项
    required(value) {
        return value !== null && value !== undefined && value.toString().trim() !== '';
    },

    // 验证长度
    length(value, min, max) {
        const len = value ? value.toString().length : 0;
        return len >= min && len <= max;
    }
};

// 初始化应用
function initApp() {
    // 检查用户登录状态
    const userData = Utils.storage.get('userData') || Utils.storage.get('avaCreatorUser');
    if (userData) {
        AVACreator.user = userData;
        AVACreator.permissions = Permission.getPermissions(userData.role);
    }

    // 添加全局错误处理
    window.addEventListener('error', function(event) {
        console.error('全局错误:', event.error);
        Notification.error('发生了一个错误，请刷新页面重试');
    });

    // 添加未处理的Promise错误处理
    window.addEventListener('unhandledrejection', function(event) {
        console.error('未处理的Promise错误:', event.reason);
        Notification.error('网络请求失败，请检查网络连接');
    });
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// 导出到全局
window.Utils = Utils;
window.API = API;
window.Permission = Permission;
window.Notification = Notification;
window.Router = Router;
window.Validator = Validator;