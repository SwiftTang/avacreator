// Dashboard 页面逻辑

// 页面状态管理
const DashboardState = {
    user: null,
    notifications: [],
    dashboardData: {},
    isLoading: false
};

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    initDashboard();
});

// 初始化仪表板
async function initDashboard() {
    try {
        // 检查用户登录状态
        const user = getCurrentUser();
        if (!user) {
            window.location.href = '/';
            return;
        }

        DashboardState.user = user;
        
        // 更新用户界面
        updateUserInterface();
        
        // 加载角色导航
        loadRoleNavigation();
        
        // 加载仪表板数据
        await loadDashboardData();
        
        // 加载通知
        await loadNotifications();
        
    } catch (error) {
        console.error('仪表板初始化失败:', error);
        showError('加载失败，请刷新页面重试');
    }
}

// 获取当前用户
function getCurrentUser() {
    const userData = localStorage.getItem('userData') || localStorage.getItem('avaCreatorUser');
    return userData ? JSON.parse(userData) : null;
}

// 更新用户界面
function updateUserInterface() {
    const user = DashboardState.user;
    if (!user) return;

    // 更新用户名显示
    const usernameEl = document.getElementById('currentUsername');
    if (usernameEl) {
        usernameEl.textContent = user.username || user.nickname || '用户';
    }

    // 更新角色显示
    const roleEl = document.getElementById('userRole');
    if (roleEl) {
        const roleNames = {
            'admin': '管理员',
            'investor': '投资者',
            'product_manager': '产品经理',
            'designer': '设计师',
            'developer': '开发者'
        };
        roleEl.textContent = roleNames[user.role] || '用户';
    }
}

// 加载角色导航
function loadRoleNavigation() {
    const user = DashboardState.user;
    const roleNavSection = document.getElementById('roleNavSection');
    
    if (!roleNavSection || !user) return;

    const navigation = getRoleNavigation(user.role);
    
    if (navigation.length === 0) return;

    roleNavSection.innerHTML = `
        <h3>专业功能</h3>
        <ul class="nav-list">
            ${navigation.map(item => `
                <li><a href="${item.path}" class="nav-item">
                    <span class="icon">${item.icon}</span>${item.name}
                </a></li>
            `).join('')}
        </ul>
    `;
}

// 获取角色导航配置 - admin用户拥有最高权限，可访问所有功能
function getRoleNavigation(role) {
    const navigation = {
        admin: [
            { name: '运营中心', path: '/operations', icon: '⚙️' },
            { name: '创意中心', path: '/ideas', icon: '💡' },
            { name: '项目中心', path: '/projects', icon: '📋' },
            { name: '任务中心', path: '/tasks', icon: '✅' },
            { name: '产品中心', path: '/products', icon: '📦' },
            { name: '用户管理', path: '/users', icon: '👥' },
            { name: '系统设置', path: '/settings', icon: '⚙️' }
        ],
        investor: [
            { name: '创意中心', path: '/ideas', icon: '💡' },
            { name: '项目中心', path: '/projects', icon: '📋' },
            { name: '产品中心', path: '/products', icon: '📦' }
        ],
        product_manager: [
            { name: '创意中心', path: '/ideas', icon: '💡' },
            { name: '项目中心', path: '/projects', icon: '📋' },
            { name: '任务中心', path: '/tasks', icon: '✅' },
            { name: '产品中心', path: '/products', icon: '📦' }
        ],
        designer: [
            { name: '创意中心', path: '/ideas', icon: '💡' },
            { name: '项目中心', path: '/projects', icon: '📋' },
            { name: '任务中心', path: '/tasks', icon: '✅' },
            { name: '产品中心', path: '/products', icon: '📦' }
        ],
        developer: [
            { name: '创意中心', path: '/ideas', icon: '💡' },
            { name: '项目中心', path: '/projects', icon: '📋' },
            { name: '任务中心', path: '/tasks', icon: '✅' },
            { name: '产品中心', path: '/products', icon: '📦' }
        ]
    };

    return navigation[role] || [];
}

// 加载仪表板数据
async function loadDashboardData() {
    const user = DashboardState.user;
    const dashboardContent = document.getElementById('dashboardContent');
    
    if (!dashboardContent) return;

    // 显示加载状态
    dashboardContent.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

    try {
        // 根据用户角色加载不同的仪表板内容
        let content = '';
        
        switch (user.role) {
            case 'admin':
                content = await generateAdminDashboard();
                break;
            case 'investor':
                content = await generateInvestorDashboard();
                break;
            case 'product_manager':
                content = await generateProductManagerDashboard();
                break;
            case 'designer':
                content = await generateDesignerDashboard();
                break;
            case 'developer':
                content = await generateDeveloperDashboard();
                break;
            default:
                content = await generateDefaultDashboard();
        }

        dashboardContent.innerHTML = content;
        
    } catch (error) {
        console.error('加载仪表板数据失败:', error);
        dashboardContent.innerHTML = `
            <div class="empty-state">
                <div class="icon">⚠️</div>
                <h3>加载失败</h3>
                <p>无法加载仪表板数据，请稍后重试</p>
            </div>
        `;
    }
}

// 生成管理员仪表板
async function generateAdminDashboard() {
    const stats = {
        totalUsers: 1250,
        activeProjects: 45,
        completedTasks: 892,
        platformRevenue: 125000
    };

    return `
        <div class="stats-grid">
            <div class="stat-card">
                <span class="icon">👥</span>
                <div class="value">${stats.totalUsers}</div>
                <div class="label">总用户数</div>
                <div class="change positive">+12% 本月</div>
            </div>
            <div class="stat-card">
                <span class="icon">📋</span>
                <div class="value">${stats.activeProjects}</div>
                <div class="label">活跃项目</div>
                <div class="change positive">+8% 本周</div>
            </div>
            <div class="stat-card">
                <span class="icon">✅</span>
                <div class="value">${stats.completedTasks}</div>
                <div class="label">完成任务</div>
                <div class="change positive">+15% 本月</div>
            </div>
            <div class="stat-card">
                <span class="icon">💰</span>
                <div class="value">¥${(stats.platformRevenue / 1000).toFixed(0)}K</div>
                <div class="label">平台收入</div>
                <div class="change positive">+22% 本月</div>
            </div>
        </div>

        <div class="content-section">
            <div class="section-header">
                <h3 class="section-title">最近活动</h3>
                <button class="section-action" onclick="viewAllActivities()">查看全部</button>
            </div>
            <div class="item-list">
                <div class="list-item">
                    <div class="item-info">
                        <div class="item-icon">👤</div>
                        <div class="item-details">
                            <h4>新用户注册</h4>
                            <p>设计师 张小明 加入平台</p>
                        </div>
                    </div>
                    <div class="item-status status-active">刚刚</div>
                </div>
                <div class="list-item">
                    <div class="item-info">
                        <div class="item-icon">📋</div>
                        <div class="item-details">
                            <h4>项目创建</h4>
                            <p>智能家居控制系统项目启动</p>
                        </div>
                    </div>
                    <div class="item-status status-pending">5分钟前</div>
                </div>
                <div class="list-item">
                    <div class="item-info">
                        <div class="item-icon">✅</div>
                        <div class="item-details">
                            <h4>任务完成</h4>
                            <p>UI设计任务已通过评审</p>
                        </div>
                    </div>
                    <div class="item-status status-completed">10分钟前</div>
                </div>
            </div>
        </div>

        <div class="content-section">
            <div class="section-header">
                <h3 class="section-title">系统状态</h3>
                <button class="section-action" onclick="viewSystemHealth()">详细信息</button>
            </div>
            <div class="item-list">
                <div class="list-item">
                    <div class="item-info">
                        <div class="item-icon">🟢</div>
                        <div class="item-details">
                            <h4>服务器状态</h4>
                            <p>所有服务正常运行</p>
                        </div>
                    </div>
                    <div class="item-status status-active">正常</div>
                </div>
                <div class="list-item">
                    <div class="item-info">
                        <div class="item-icon">🟡</div>
                        <div class="item-details">
                            <h4>数据库性能</h4>
                            <p>响应时间略高，建议优化</p>
                        </div>
                    </div>
                    <div class="item-status status-pending">注意</div>
                </div>
            </div>
        </div>
    `;
}

// 生成投资者仪表板
async function generateInvestorDashboard() {
    return `
        <div class="stats-grid">
            <div class="stat-card">
                <span class="icon">💼</span>
                <div class="value">8</div>
                <div class="label">投资项目</div>
                <div class="change positive">+2 本月</div>
            </div>
            <div class="stat-card">
                <span class="icon">📈</span>
                <div class="value">15.8%</div>
                <div class="label">平均收益率</div>
                <div class="change positive">+2.3% 本季</div>
            </div>
            <div class="stat-card">
                <span class="icon">💰</span>
                <div class="value">¥580K</div>
                <div class="label">总投资额</div>
                <div class="change positive">+120K 本月</div>
            </div>
            <div class="stat-card">
                <span class="icon">🎯</span>
                <div class="value">3</div>
                <div class="label">待评估项目</div>
                <div class="change">需要关注</div>
            </div>
        </div>

        <div class="content-section">
            <div class="section-header">
                <h3 class="section-title">我的投资项目</h3>
                <button class="section-action" onclick="viewAllProjects()">查看全部</button>
            </div>
            <div class="item-list">
                <div class="list-item">
                    <div class="item-info">
                        <div class="item-icon">🏠</div>
                        <div class="item-details">
                            <h4>智能家居控制系统</h4>
                            <p>开发进度: 75% | 预期收益: 18%</p>
                        </div>
                    </div>
                    <div class="item-status status-active">进行中</div>
                </div>
                <div class="list-item">
                    <div class="item-info">
                        <div class="item-icon">📱</div>
                        <div class="item-details">
                            <h4>移动支付应用</h4>
                            <p>开发进度: 90% | 预期收益: 22%</p>
                        </div>
                    </div>
                    <div class="item-status status-pending">测试中</div>
                </div>
            </div>
        </div>

        <div class="content-section">
            <div class="section-header">
                <h3 class="section-title">推荐项目</h3>
                <button class="section-action" onclick="viewRecommendations()">更多推荐</button>
            </div>
            <div class="item-list">
                <div class="list-item">
                    <div class="item-info">
                        <div class="item-icon">🤖</div>
                        <div class="item-details">
                            <h4>AI客服机器人</h4>
                            <p>市场前景优秀，技术团队实力强</p>
                        </div>
                    </div>
                    <div class="item-status status-pending">评估中</div>
                </div>
            </div>
        </div>
    `;
}

// 生成产品经理仪表板
async function generateProductManagerDashboard() {
    return `
        <div class="stats-grid">
            <div class="stat-card">
                <span class="icon">📋</span>
                <div class="value">5</div>
                <div class="label">负责项目</div>
                <div class="change positive">+1 本月</div>
            </div>
            <div class="stat-card">
                <span class="icon">✅</span>
                <div class="value">23</div>
                <div class="label">待评审任务</div>
                <div class="change">需要处理</div>
            </div>
            <div class="stat-card">
                <span class="icon">👥</span>
                <div class="value">15</div>
                <div class="label">团队成员</div>
                <div class="change positive">活跃度 92%</div>
            </div>
            <div class="stat-card">
                <span class="icon">📊</span>
                <div class="value">88%</div>
                <div class="label">按时完成率</div>
                <div class="change positive">+5% 本月</div>
            </div>
        </div>

        <div class="content-section">
            <div class="section-header">
                <h3 class="section-title">待评审任务</h3>
                <button class="section-action" onclick="viewAllTasks()">查看全部</button>
            </div>
            <div class="item-list">
                <div class="list-item">
                    <div class="item-info">
                        <div class="item-icon">🎨</div>
                        <div class="item-details">
                            <h4>首页UI设计</h4>
                            <p>设计师: 李小红 | 提交时间: 2小时前</p>
                        </div>
                    </div>
                    <div class="item-status status-pending">待评审</div>
                </div>
                <div class="list-item">
                    <div class="item-info">
                        <div class="item-icon">💻</div>
                        <div class="item-details">
                            <h4>用户登录接口</h4>
                            <p>开发者: 王小明 | 提交时间: 1天前</p>
                        </div>
                    </div>
                    <div class="item-status status-pending">待评审</div>
                </div>
            </div>
        </div>

        <div class="content-section">
            <div class="section-header">
                <h3 class="section-title">项目进度</h3>
                <button class="section-action" onclick="viewProjectDetails()">详细报告</button>
            </div>
            <div class="item-list">
                <div class="list-item">
                    <div class="item-info">
                        <div class="item-icon">🏠</div>
                        <div class="item-details">
                            <h4>智能家居控制系统</h4>
                            <p>进度: 75% | 里程碑: 3/4 完成</p>
                        </div>
                    </div>
                    <div class="item-status status-active">正常</div>
                </div>
            </div>
        </div>
    `;
}

// 生成设计师仪表板
async function generateDesignerDashboard() {
    return `
        <div class="stats-grid">
            <div class="stat-card">
                <span class="icon">🎨</span>
                <div class="value">12</div>
                <div class="label">进行中任务</div>
                <div class="change">优先级高: 3个</div>
            </div>
            <div class="stat-card">
                <span class="icon">✅</span>
                <div class="value">45</div>
                <div class="label">本月完成</div>
                <div class="change positive">+8 比上月</div>
            </div>
            <div class="stat-card">
                <span class="icon">⭐</span>
                <div class="value">4.8</div>
                <div class="label">平均评分</div>
                <div class="change positive">+0.2 本月</div>
            </div>
            <div class="stat-card">
                <span class="icon">💰</span>
                <div class="value">¥8.5K</div>
                <div class="label">本月收入</div>
                <div class="change positive">+15% 本月</div>
            </div>
        </div>

        <div class="content-section">
            <div class="section-header">
                <h3 class="section-title">我的任务</h3>
                <button class="section-action" onclick="viewAllMyTasks()">查看全部</button>
            </div>
            <div class="item-list">
                <div class="list-item">
                    <div class="item-info">
                        <div class="item-icon">🎨</div>
                        <div class="item-details">
                            <h4>移动应用界面设计</h4>
                            <p>截止时间: 明天 | 报酬: ¥1200</p>
                        </div>
                    </div>
                    <div class="item-status status-pending">进行中</div>
                </div>
                <div class="list-item">
                    <div class="item-info">
                        <div class="item-icon">🖼️</div>
                        <div class="item-details">
                            <h4>品牌Logo设计</h4>
                            <p>截止时间: 3天后 | 报酬: ¥800</p>
                        </div>
                    </div>
                    <div class="item-status status-active">新任务</div>
                </div>
            </div>
        </div>

        <div class="content-section">
            <div class="section-header">
                <h3 class="section-title">设计资源</h3>
                <button class="section-action" onclick="viewResources()">更多资源</button>
            </div>
            <div class="item-list">
                <div class="list-item">
                    <div class="item-info">
                        <div class="item-icon">🎨</div>
                        <div class="item-details">
                            <h4>设计规范文档</h4>
                            <p>最新的UI设计规范和组件库</p>
                        </div>
                    </div>
                    <div class="item-status status-active">已更新</div>
                </div>
            </div>
        </div>
    `;
}

// 生成开发者仪表板
async function generateDeveloperDashboard() {
    return `
        <div class="stats-grid">
            <div class="stat-card">
                <span class="icon">💻</span>
                <div class="value">8</div>
                <div class="label">进行中任务</div>
                <div class="change">紧急: 2个</div>
            </div>
            <div class="stat-card">
                <span class="icon">🐛</span>
                <div class="value">3</div>
                <div class="label">待修复Bug</div>
                <div class="change negative">需要关注</div>
            </div>
            <div class="stat-card">
                <span class="icon">📊</span>
                <div class="value">156</div>
                <div class="label">本月提交</div>
                <div class="change positive">+23 比上月</div>
            </div>
            <div class="stat-card">
                <span class="icon">💰</span>
                <div class="value">¥12.3K</div>
                <div class="label">本月收入</div>
                <div class="change positive">+18% 本月</div>
            </div>
        </div>

        <div class="content-section">
            <div class="section-header">
                <h3 class="section-title">我的任务</h3>
                <button class="section-action" onclick="viewAllMyTasks()">查看全部</button>
            </div>
            <div class="item-list">
                <div class="list-item">
                    <div class="item-info">
                        <div class="item-icon">⚡</div>
                        <div class="item-details">
                            <h4>API接口开发</h4>
                            <p>截止时间: 今天 | 报酬: ¥1500</p>
                        </div>
                    </div>
                    <div class="item-status status-pending">紧急</div>
                </div>
                <div class="list-item">
                    <div class="item-info">
                        <div class="item-icon">🐛</div>
                        <div class="item-details">
                            <h4>登录Bug修复</h4>
                            <p>截止时间: 明天 | 报酬: ¥600</p>
                        </div>
                    </div>
                    <div class="item-status status-active">进行中</div>
                </div>
            </div>
        </div>

        <div class="content-section">
            <div class="section-header">
                <h3 class="section-title">技术文档</h3>
                <button class="section-action" onclick="viewDocs()">更多文档</button>
            </div>
            <div class="item-list">
                <div class="list-item">
                    <div class="item-info">
                        <div class="item-icon">📚</div>
                        <div class="item-details">
                            <h4>开发规范</h4>
                            <p>代码规范和最佳实践指南</p>
                        </div>
                    </div>
                    <div class="item-status status-active">已更新</div>
                </div>
            </div>
        </div>
    `;
}

// 生成默认仪表板
async function generateDefaultDashboard() {
    return `
        <div class="content-section">
            <div class="section-header">
                <h3 class="section-title">欢迎使用 AVACreator</h3>
            </div>
            <div class="empty-state">
                <div class="icon">🚀</div>
                <h3>开始您的创新之旅</h3>
                <p>探索平台功能，参与协作项目，实现创意价值</p>
            </div>
        </div>
    `;
}

// 加载通知
async function loadNotifications() {
    try {
        // 模拟通知数据
        const notifications = [
            {
                id: 1,
                title: '新任务分配',
                content: '您有一个新的设计任务等待处理',
                time: '5分钟前',
                type: 'task'
            },
            {
                id: 2,
                title: '项目更新',
                content: '智能家居项目进度已更新',
                time: '1小时前',
                type: 'project'
            },
            {
                id: 3,
                title: '系统通知',
                content: '平台将于今晚进行维护升级',
                time: '2小时前',
                type: 'system'
            }
        ];

        DashboardState.notifications = notifications;
        
        // 更新通知计数
        const notificationCount = document.getElementById('notificationCount');
        if (notificationCount) {
            notificationCount.textContent = notifications.length;
            notificationCount.style.display = notifications.length > 0 ? 'flex' : 'none';
        }

    } catch (error) {
        console.error('加载通知失败:', error);
    }
}

// 显示通知
function showNotifications() {
    const modal = document.getElementById('notificationModal');
    const notificationList = document.getElementById('notificationList');
    
    if (!modal || !notificationList) return;

    // 生成通知列表
    const notificationsHTML = DashboardState.notifications.map(notification => `
        <div class="notification-item">
            <div class="title">${notification.title}</div>
            <div class="content">${notification.content}</div>
            <div class="time">${notification.time}</div>
        </div>
    `).join('');

    notificationList.innerHTML = notificationsHTML || `
        <div class="empty-state">
            <div class="icon">📭</div>
            <h3>暂无通知</h3>
            <p>您的通知将显示在这里</p>
        </div>
    `;

    modal.style.display = 'block';
}

// 隐藏通知
function hideNotifications() {
    const modal = document.getElementById('notificationModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 切换用户菜单
function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

// 退出登录
function logout() {
    // 清除用户数据
    localStorage.removeItem('userData');
    localStorage.removeItem('avaCreatorUser');
    localStorage.removeItem('lastCheckin');
    
    // 跳转到首页
    window.location.href = '/';
}

// 显示错误信息
function showError(message) {
    // 简单的错误提示，可以后续优化为更好的UI组件
    alert(message);
}

// 点击外部关闭下拉菜单
document.addEventListener('click', function(event) {
    const userMenu = document.querySelector('.user-menu');
    const dropdown = document.getElementById('userDropdown');
    
    if (dropdown && !userMenu.contains(event.target)) {
        dropdown.classList.remove('show');
    }
});

// 点击外部关闭通知弹窗
window.onclick = function(event) {
    const modal = document.getElementById('notificationModal');
    if (event.target === modal) {
        hideNotifications();
    }
}

// 占位函数 - 后续实现具体功能
function viewAllActivities() { console.log('查看所有活动'); }
function viewSystemHealth() { console.log('查看系统健康状态'); }
function viewAllProjects() { console.log('查看所有项目'); }
function viewRecommendations() { console.log('查看推荐项目'); }
function viewAllTasks() { console.log('查看所有任务'); }
function viewProjectDetails() { console.log('查看项目详情'); }
function viewAllMyTasks() { console.log('查看我的任务'); }
function viewResources() { console.log('查看设计资源'); }
function viewDocs() { console.log('查看技术文档'); }