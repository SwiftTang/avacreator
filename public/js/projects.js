// 项目中心页面逻辑

// 页面状态管理
const ProjectsState = {
    user: null,
    projects: [],
    filteredProjects: [],
    currentPage: 1,
    pageSize: 9,
    totalPages: 1,
    filters: {
        status: 'all',
        category: 'all',
        search: ''
    }
};

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    initProjectsPage();
});

// 初始化项目页面
async function initProjectsPage() {
    try {
        // 检查用户登录状态
        const user = getCurrentUser();
        if (!user) {
            window.location.href = '/';
            return;
        }

        ProjectsState.user = user;
        
        // 更新用户界面
        updateUserInterface();
        
        // 加载用户角色相关的操作按钮
        loadHeaderActions();
        
        // 加载项目数据
        await loadProjects();
        
    } catch (error) {
        console.error('项目页面初始化失败:', error);
        Notification.error('页面加载失败，请刷新重试');
    }
}

// 获取当前用户
function getCurrentUser() {
    const userData = Utils.storage.get('userData') || Utils.storage.get('avaCreatorUser');
    return userData ? JSON.parse(userData) : null;
}

// 更新用户界面
function updateUserInterface() {
    const user = ProjectsState.user;
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

// 加载头部操作按钮 - admin用户拥有最高权限
function loadHeaderActions() {
    const user = ProjectsState.user;
    const headerActions = document.getElementById('headerActions');
    
    if (!headerActions || !user) return;

    let actionsHTML = '';

    // admin用户拥有最高权限，可以执行所有操作
    if (user.role === 'admin') {
        actionsHTML += `
            <button class="action-btn" onclick="showCreateProject()">
                <span>➕</span>创建项目
            </button>
            <button class="action-btn secondary" onclick="exportProjects()">
                <span>📊</span>导出数据
            </button>
            <button class="action-btn secondary" onclick="manageAllProjects()">
                <span>⚙️</span>项目管理
            </button>
        `;
    } else if (user.role === 'product_manager' || user.role === 'investor') {
        actionsHTML += `
            <button class="action-btn" onclick="showCreateProject()">
                <span>➕</span>创建项目
            </button>
        `;
    }

    actionsHTML += `
        <button class="action-btn secondary" onclick="refreshProjects()">
            <span>🔄</span>刷新
        </button>
    `;

    headerActions.innerHTML = actionsHTML;
}

// 加载项目数据
async function loadProjects() {
    const projectsGrid = document.getElementById('projectsGrid');
    
    if (!projectsGrid) return;

    // 显示加载状态
    projectsGrid.innerHTML = '<div class="projects-loading"><div class="spinner"></div></div>';

    try {
        // 模拟API请求延迟
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // 模拟项目数据
        const mockProjects = generateMockProjects();
        
        ProjectsState.projects = mockProjects;
        ProjectsState.filteredProjects = mockProjects;
        
        // 计算分页
        calculatePagination();
        
        // 渲染项目列表
        renderProjects();
        
        // 渲染分页
        renderPagination();
        
    } catch (error) {
        console.error('加载项目数据失败:', error);
        projectsGrid.innerHTML = `
            <div class="empty-projects">
                <div class="icon">⚠️</div>
                <h3>加载失败</h3>
                <p>无法加载项目数据，请稍后重试</p>
                <button class="action-btn" onclick="loadProjects()">重新加载</button>
            </div>
        `;
    }
}

// 生成模拟项目数据
function generateMockProjects() {
    const categories = ['web', 'mobile', 'ai', 'iot'];
    const statuses = ['planning', 'development', 'testing', 'completed'];
    const budgets = ['small', 'medium', 'large'];
    
    const projects = [
        {
            id: 1,
            name: '智能家居控制系统',
            description: '基于物联网技术的智能家居控制平台，支持语音控制、远程监控和自动化场景设置。',
            category: 'iot',
            status: 'development',
            budget: 'large',
            progress: 75,
            createdAt: '2024-01-15',
            team: [
                { name: '张三', avatar: '👨‍💻' },
                { name: '李四', avatar: '👩‍🎨' },
                { name: '王五', avatar: '👨‍💼' }
            ]
        },
        {
            id: 2,
            name: '移动支付应用',
            description: '安全便捷的移动支付解决方案，支持多种支付方式和商户管理功能。',
            category: 'mobile',
            status: 'testing',
            budget: 'medium',
            progress: 90,
            createdAt: '2024-02-01',
            team: [
                { name: '赵六', avatar: '👨‍💻' },
                { name: '钱七', avatar: '👩‍💻' }
            ]
        },
        {
            id: 3,
            name: 'AI客服机器人',
            description: '基于自然语言处理的智能客服系统，提供24/7在线客户服务支持。',
            category: 'ai',
            status: 'planning',
            budget: 'medium',
            progress: 25,
            createdAt: '2024-02-10',
            team: [
                { name: '孙八', avatar: '🤖' },
                { name: '周九', avatar: '👨‍🔬' }
            ]
        },
        {
            id: 4,
            name: '企业管理系统',
            description: '综合性企业资源管理平台，包含人事、财务、项目管理等模块。',
            category: 'web',
            status: 'development',
            budget: 'large',
            progress: 60,
            createdAt: '2024-01-20',
            team: [
                { name: '吴十', avatar: '👨‍💼' },
                { name: '郑一', avatar: '👩‍💼' },
                { name: '王二', avatar: '👨‍💻' },
                { name: '李三', avatar: '👩‍🎨' }
            ]
        },
        {
            id: 5,
            name: '在线教育平台',
            description: '互动式在线学习平台，支持直播授课、作业提交和学习进度跟踪。',
            category: 'web',
            status: 'completed',
            budget: 'medium',
            progress: 100,
            createdAt: '2023-12-01',
            team: [
                { name: '张四', avatar: '👨‍🏫' },
                { name: '李五', avatar: '👩‍💻' }
            ]
        },
        {
            id: 6,
            name: '健康监测设备',
            description: '可穿戴健康监测设备，实时监测心率、血压等生理指标。',
            category: 'iot',
            status: 'testing',
            budget: 'small',
            progress: 85,
            createdAt: '2024-01-30',
            team: [
                { name: '王六', avatar: '👨‍⚕️' },
                { name: '赵七', avatar: '👩‍🔬' }
            ]
        }
    ];

    return projects;
}

// 渲染项目列表
function renderProjects() {
    const projectsGrid = document.getElementById('projectsGrid');
    if (!projectsGrid) return;

    const startIndex = (ProjectsState.currentPage - 1) * ProjectsState.pageSize;
    const endIndex = startIndex + ProjectsState.pageSize;
    const pageProjects = ProjectsState.filteredProjects.slice(startIndex, endIndex);

    if (pageProjects.length === 0) {
        projectsGrid.innerHTML = `
            <div class="empty-projects">
                <div class="icon">📋</div>
                <h3>暂无项目</h3>
                <p>还没有符合条件的项目，创建一个新项目开始吧！</p>
                ${canCreateProject() ? '<button class="action-btn" onclick="showCreateProject()">创建项目</button>' : ''}
            </div>
        `;
        return;
    }

    const projectsHTML = pageProjects.map(project => `
        <div class="project-card">
            <div class="project-header">
                <div>
                    <h3 class="project-title">${project.name}</h3>
                    <span class="project-category">${getCategoryName(project.category)}</span>
                </div>
            </div>
            
            <p class="project-description">${project.description}</p>
            
            <div class="project-meta">
                <span class="project-budget">${getBudgetName(project.budget)}</span>
                <span class="project-date">${Utils.formatDate(project.createdAt)}</span>
            </div>
            
            <div class="project-progress">
                <div class="progress-label">
                    <span class="progress-text">项目进度</span>
                    <span class="progress-percentage">${project.progress}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${project.progress}%"></div>
                </div>
            </div>
            
            <div class="project-status status-${project.status}">${getStatusName(project.status)}</div>
            
            <div class="project-team">
                <div class="team-avatars">
                    ${project.team.slice(0, 3).map(member => `
                        <div class="team-avatar" title="${member.name}">${member.avatar}</div>
                    `).join('')}
                </div>
                <span class="team-count">${project.team.length} 人团队</span>
            </div>
            
            <div class="project-actions">
                <button class="project-btn primary" onclick="viewProject(${project.id})">查看详情</button>
                ${canManageProject(project) ? `<button class="project-btn secondary" onclick="editProject(${project.id})">编辑</button>` : ''}
            </div>
        </div>
    `).join('');

    projectsGrid.innerHTML = projectsHTML;
}

// 计算分页
function calculatePagination() {
    ProjectsState.totalPages = Math.ceil(ProjectsState.filteredProjects.length / ProjectsState.pageSize);
    if (ProjectsState.currentPage > ProjectsState.totalPages) {
        ProjectsState.currentPage = 1;
    }
}

// 渲染分页
function renderPagination() {
    const pagination = document.getElementById('pagination');
    if (!pagination || ProjectsState.totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

    let paginationHTML = '';

    // 上一页按钮
    paginationHTML += `
        <button class="pagination-btn" onclick="changePage(${ProjectsState.currentPage - 1})" 
                ${ProjectsState.currentPage === 1 ? 'disabled' : ''}>
            ‹ 上一页
        </button>
    `;

    // 页码按钮
    const startPage = Math.max(1, ProjectsState.currentPage - 2);
    const endPage = Math.min(ProjectsState.totalPages, ProjectsState.currentPage + 2);

    if (startPage > 1) {
        paginationHTML += `<button class="pagination-btn" onclick="changePage(1)">1</button>`;
        if (startPage > 2) {
            paginationHTML += `<span class="pagination-ellipsis">...</span>`;
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button class="pagination-btn ${i === ProjectsState.currentPage ? 'active' : ''}" 
                    onclick="changePage(${i})">${i}</button>
        `;
    }

    if (endPage < ProjectsState.totalPages) {
        if (endPage < ProjectsState.totalPages - 1) {
            paginationHTML += `<span class="pagination-ellipsis">...</span>`;
        }
        paginationHTML += `<button class="pagination-btn" onclick="changePage(${ProjectsState.totalPages})">${ProjectsState.totalPages}</button>`;
    }

    // 下一页按钮
    paginationHTML += `
        <button class="pagination-btn" onclick="changePage(${ProjectsState.currentPage + 1})" 
                ${ProjectsState.currentPage === ProjectsState.totalPages ? 'disabled' : ''}>
            下一页 ›
        </button>
    `;

    pagination.innerHTML = paginationHTML;
}

// 切换页面
function changePage(page) {
    if (page < 1 || page > ProjectsState.totalPages) return;
    
    ProjectsState.currentPage = page;
    renderProjects();
    renderPagination();
    
    // 滚动到顶部
    document.querySelector('.main-content').scrollTop = 0;
}

// 筛选项目
function filterProjects() {
    const statusFilter = document.getElementById('statusFilter').value;
    const categoryFilter = document.getElementById('categoryFilter').value;
    const searchInput = document.getElementById('searchInput').value.toLowerCase();

    ProjectsState.filters = {
        status: statusFilter,
        category: categoryFilter,
        search: searchInput
    };

    ProjectsState.filteredProjects = ProjectsState.projects.filter(project => {
        // 状态筛选
        if (statusFilter !== 'all' && project.status !== statusFilter) {
            return false;
        }

        // 分类筛选
        if (categoryFilter !== 'all' && project.category !== categoryFilter) {
            return false;
        }

        // 搜索筛选
        if (searchInput && !project.name.toLowerCase().includes(searchInput) && 
            !project.description.toLowerCase().includes(searchInput)) {
            return false;
        }

        return true;
    });

    ProjectsState.currentPage = 1;
    calculatePagination();
    renderProjects();
    renderPagination();
}

// 显示创建项目弹窗
function showCreateProject() {
    const modal = document.getElementById('createProjectModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

// 隐藏创建项目弹窗
function hideCreateProject() {
    const modal = document.getElementById('createProjectModal');
    if (modal) {
        modal.style.display = 'none';
        document.getElementById('createProjectForm').reset();
    }
}

// 处理创建项目
function handleCreateProject(event) {
    event.preventDefault();

    const formData = {
        name: document.getElementById('projectName').value,
        description: document.getElementById('projectDescription').value,
        category: document.getElementById('projectCategory').value,
        budget: document.getElementById('projectBudget').value
    };

    // 验证表单
    if (!formData.name || !formData.description || !formData.category) {
        Notification.error('请填写完整的项目信息');
        return;
    }

    // 模拟创建项目
    const newProject = {
        id: Date.now(),
        name: formData.name,
        description: formData.description,
        category: formData.category,
        status: 'planning',
        budget: formData.budget,
        progress: 0,
        createdAt: new Date().toISOString().split('T')[0],
        team: [
            { name: ProjectsState.user.username, avatar: '👤' }
        ]
    };

    // 添加到项目列表
    ProjectsState.projects.unshift(newProject);
    
    // 重新筛选和渲染
    filterProjects();
    
    // 关闭弹窗
    hideCreateProject();
    
    Notification.success('项目创建成功！');
}

// 查看项目详情
function viewProject(projectId) {
    // 这里可以跳转到项目详情页面
    console.log('查看项目:', projectId);
    Notification.info('项目详情页面开发中...');
}

// 编辑项目
function editProject(projectId) {
    console.log('编辑项目:', projectId);
    Notification.info('项目编辑功能开发中...');
}

// 刷新项目列表
async function refreshProjects() {
    Notification.info('正在刷新项目列表...');
    await loadProjects();
    Notification.success('项目列表已刷新');
}

// 导出项目数据
function exportProjects() {
    console.log('导出项目数据');
    Notification.info('数据导出功能开发中...');
}

// 工具函数
function getCategoryName(category) {
    const names = {
        'web': 'Web应用',
        'mobile': '移动应用',
        'ai': '人工智能',
        'iot': '物联网'
    };
    return names[category] || category;
}

function getStatusName(status) {
    const names = {
        'planning': '规划中',
        'development': '开发中',
        'testing': '测试中',
        'completed': '已完成'
    };
    return names[status] || status;
}

function getBudgetName(budget) {
    const names = {
        'small': '小型项目',
        'medium': '中型项目',
        'large': '大型项目'
    };
    return names[budget] || budget;
}

function canCreateProject() {
    const user = ProjectsState.user;
    return user && (user.role === 'admin' || user.role === 'product_manager' || user.role === 'investor');
}

function canManageProject(project) {
    const user = ProjectsState.user;
    if (!user) return false;
    
    // admin用户拥有最高权限，可以管理所有项目
    if (user.role === 'admin') return true;
    
    // 产品经理和投资者可以管理自己创建的项目
    if (user.role === 'product_manager' || user.role === 'investor') {
        return true; // 简化处理，实际应该检查项目所有者
    }
    
    return false;
}

// admin专用：管理所有项目
function manageAllProjects() {
    const user = ProjectsState.user;
    if (user.role !== 'admin') {
        Notification.error('权限不足，只有管理员可以访问此功能');
        return;
    }
    
    console.log('管理所有项目');
    Notification.info('项目管理功能开发中...');
}

// 通用函数
function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

function logout() {
    Utils.storage.remove('userData');
    Utils.storage.remove('avaCreatorUser');
    window.location.href = '/';
}

function showNotifications() {
    Notification.info('通知功能开发中...');
}

// 点击外部关闭弹窗
window.onclick = function(event) {
    const createModal = document.getElementById('createProjectModal');
    if (event.target === createModal) {
        hideCreateProject();
    }
    
    const userDropdown = document.getElementById('userDropdown');
    const userMenu = document.querySelector('.user-menu');
    if (userDropdown && !userMenu.contains(event.target)) {
        userDropdown.classList.remove('show');
    }
}