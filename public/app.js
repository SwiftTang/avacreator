// AVACreator 前端应用逻辑

// 全局状态管理
const AppState = {
    user: null,
    isLoggedIn: false
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

// 应用初始化
function initApp() {
    // 检查本地存储的用户信息
    const savedUser = localStorage.getItem('avaCreatorUser');
    if (savedUser) {
        AppState.user = JSON.parse(savedUser);
        AppState.isLoggedIn = true;
        updateUIForLoggedInUser();
    }
    
    console.log('AVACreator 应用已初始化');
}

// 显示登录弹窗
function showLogin() {
    document.getElementById('loginModal').style.display = 'block';
}

// 隐藏登录弹窗
function hideLogin() {
    document.getElementById('loginModal').style.display = 'none';
}

// 显示用户中心
function showUserCenter() {
    if (!AppState.isLoggedIn) {
        showLogin();
        return;
    }
    
    updateUserInfo();
    document.getElementById('userModal').style.display = 'block';
}

// 隐藏用户中心
function hideUserCenter() {
    document.getElementById('userModal').style.display = 'none';
}

// 模拟登录（开发模式）
function mockLogin() {
    const mockUser = {
        id: 'user_' + Date.now(),
        nickname: '创新者' + Math.floor(Math.random() * 1000),
        avatar: '👤',
        roles: ['创意者'],
        level: '注册用户',
        experience: 100,
        points: 500,
        joinDate: new Date().toISOString(),
        stats: {
            tasksCompleted: 0,
            projectsJoined: 0,
            pointsEarned: 500,
            currentStreak: 1
        }
    };
    
    // 保存用户信息
    AppState.user = mockUser;
    AppState.isLoggedIn = true;
    localStorage.setItem('avaCreatorUser', JSON.stringify(mockUser));
    
    // 更新UI
    updateUIForLoggedInUser();
    hideLogin();
    
    // 显示欢迎消息
    alert(`欢迎加入 AVACreator，${mockUser.nickname}！`);
}

// 更新已登录用户的UI
function updateUIForLoggedInUser() {
    const loginBtn = document.getElementById('loginBtn');
    const userBtn = document.getElementById('userBtn');
    
    if (loginBtn && userBtn) {
        loginBtn.style.display = 'none';
        userBtn.style.display = 'inline-block';
        userBtn.textContent = AppState.user.nickname;
    }
}

// 更新用户信息显示
function updateUserInfo() {
    const userInfoDiv = document.getElementById('userInfo');
    if (!userInfoDiv || !AppState.user) return;
    
    const user = AppState.user;
    userInfoDiv.innerHTML = `
        <div class="user-profile">
            <div class="user-avatar">${user.avatar}</div>
            <h4>${user.nickname}</h4>
            <p class="user-level">${user.level}</p>
            <p class="user-roles">角色: ${user.roles.join(', ')}</p>
        </div>
        
        <div class="user-stats">
            <div class="stat-item">
                <div class="stat-value">${user.points}</div>
                <div class="stat-label">积分</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${user.experience}</div>
                <div class="stat-label">经验值</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${user.stats.tasksCompleted}</div>
                <div class="stat-label">完成任务</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${user.stats.currentStreak}</div>
                <div class="stat-label">连续天数</div>
            </div>
        </div>
        
        <div class="user-actions" style="margin-top: 20px;">
            <button onclick="dailyCheckin()" class="btn-primary">每日签到</button>
            <button onclick="logout()" class="btn-secondary">退出登录</button>
        </div>
    `;
}

// 每日签到
function dailyCheckin() {
    if (!AppState.isLoggedIn) return;
    
    const today = new Date().toDateString();
    const lastCheckin = localStorage.getItem('lastCheckin');
    
    if (lastCheckin === today) {
        alert('今天已经签到过了！');
        return;
    }
    
    // 更新用户积分和连续天数
    AppState.user.points += 10;
    AppState.user.stats.currentStreak += 1;
    AppState.user.stats.pointsEarned += 10;
    
    // 保存数据
    localStorage.setItem('avaCreatorUser', JSON.stringify(AppState.user));
    localStorage.setItem('lastCheckin', today);
    
    // 更新显示
    updateUserInfo();
    alert('签到成功！获得 10 积分');
}

// 退出登录
function logout() {
    AppState.user = null;
    AppState.isLoggedIn = false;
    localStorage.removeItem('avaCreatorUser');
    localStorage.removeItem('lastCheckin');
    
    // 更新UI
    const loginBtn = document.getElementById('loginBtn');
    const userBtn = document.getElementById('userBtn');
    
    if (loginBtn && userBtn) {
        loginBtn.style.display = 'inline-block';
        userBtn.style.display = 'none';
    }
    
    hideUserCenter();
    alert('已退出登录');
}

// 滚动到功能区域
function scrollToFeatures() {
    document.getElementById('features').scrollIntoView({ 
        behavior: 'smooth' 
    });
}

// 点击弹窗外部关闭
window.onclick = function(event) {
    const loginModal = document.getElementById('loginModal');
    const userModal = document.getElementById('userModal');
    
    if (event.target === loginModal) {
        hideLogin();
    }
    if (event.target === userModal) {
        hideUserCenter();
    }
}

// API测试功能
async function testAPI() {
    const result = document.getElementById('apiResult');
    result.style.display = 'block';
    result.innerHTML = '请求中...';
    
    try {
        const response = await fetch('/api/hello?name=AVACreator用户');
        const data = await response.json();
        result.innerHTML = JSON.stringify(data, null, 2);
    } catch (error) {
        result.innerHTML = '错误: ' + error.message;
    }
}

// 测试用户API
async function testUserAPI() {
    const result = document.getElementById('apiResult');
    result.style.display = 'block';
    result.innerHTML = '请求中...';
    
    try {
        const response = await fetch('/api/user/profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: AppState.user?.id || 'anonymous',
                action: 'getProfile'
            })
        });
        const data = await response.json();
        result.innerHTML = JSON.stringify(data, null, 2);
    } catch (error) {
        result.innerHTML = '错误: ' + error.message;
    }
}

// 工具函数：格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN');
}

// 工具函数：计算等级
function calculateLevel(experience) {
    if (experience < 100) return '注册用户';
    if (experience < 500) return '初级用户';
    if (experience < 2000) return '专业用户';
    if (experience < 5000) return '专家用户';
    return '大师用户';
}

// 导出给其他模块使用
window.AVACreator = {
    AppState,
    showLogin,
    showUserCenter,
    mockLogin,
    dailyCheckin,
    logout
};