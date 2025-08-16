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
    showLoginTab(); // 默认显示登录表单
}

// 隐藏登录弹窗
function hideLogin() {
    document.getElementById('loginModal').style.display = 'none';
    // 重置表单
    const loginForm = document.querySelector('#loginForm form');
    const registerForm = document.querySelector('#registerForm form');
    if (loginForm) loginForm.reset();
    if (registerForm) registerForm.reset();
}

// 显示登录标签页
function showLoginTab() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('wechatLogin').style.display = 'none';
    
    // 更新标签按钮状态
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-btn')[0].classList.add('active');
}

// 显示注册标签页
function showRegisterTab() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
    document.getElementById('wechatLogin').style.display = 'none';
    
    // 更新标签按钮状态
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-btn')[1].classList.add('active');
}

// 显示微信登录
function showWechatLogin() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('wechatLogin').style.display = 'block';
}

// 返回登录表单
function backToLogin() {
    showLoginTab();
}

// 处理登录表单提交
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    // 简单验证
    if (!username || !password) {
        alert('请填写完整的登录信息');
        return;
    }
    
    // 模拟登录请求
    console.log('登录请求:', { username, password });
    
    // 模拟成功登录
    const userData = {
        id: Date.now(),
        username: username,
        email: username.includes('@') ? username : `${username}@example.com`,
        loginTime: new Date().toISOString(),
        points: 100,
        level: 1,
        completedTasks: 0
    };
    
    // 保存用户数据
    localStorage.setItem('userData', JSON.stringify(userData));
    
    // 更新UI
    updateUserInterface(userData);
    hideLogin();
    
    alert('登录成功！');
}

// 处理注册表单提交
function handleRegister(event) {
    event.preventDefault();
    
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // 验证表单
    if (!username || !password || !confirmPassword) {
        alert('请填写完整的注册信息');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('两次输入的密码不一致');
        return;
    }
    
    if (password.length < 6) {
        alert('密码长度至少6位');
        return;
    }
    
    // 模拟注册请求
    console.log('注册请求:', { username, password });
    
    // 模拟成功注册
    const userData = {
        id: Date.now(),
        username: username,
        registerTime: new Date().toISOString(),
        points: 50, // 新用户奖励积分
        level: 1,
        completedTasks: 0
    };
    
    // 保存用户数据
    localStorage.setItem('userData', JSON.stringify(userData));
    
    // 更新UI
    updateUserInterface(userData);
    hideLogin();
    
    alert('注册成功！获得新用户奖励积分50分');
}

// 更新用户界面
function updateUserInterface(userData) {
    // 隐藏登录按钮，显示用户按钮
    document.getElementById('loginBtn').style.display = 'none';
    document.getElementById('userBtn').style.display = 'inline-block';
    document.getElementById('userBtn').textContent = `${userData.username}`;
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