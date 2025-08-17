// 用户中心管理系统
class UserCenter {
    constructor() {
        this.currentUser = {
            id: 'user001',
            name: '张三',
            email: 'zhangsan@example.com',
            phone: '13800138000',
            bio: '热爱创新，专注于前端开发和用户体验设计。',
            role: '普通用户',
            avatar: 'https://via.placeholder.com/80',
            ideasCount: 12,
            projectsCount: 5,
            pointsCount: 850
        };
        
        this.recentActivities = [
            {
                icon: '💡',
                content: '发布了新创意 "智能家居控制系统"',
                time: '2小时前'
            },
            {
                icon: '📁',
                content: '加入了项目 "移动应用开发"',
                time: '1天前'
            },
            {
                icon: '⭐',
                content: '获得积分奖励 +50积分',
                time: '3天前'
            },
            {
                icon: '🎯',
                content: '完成了任务 "界面设计优化"',
                time: '5天前'
            },
            {
                icon: '🏆',
                content: '创意被采纳，获得 +100积分',
                time: '1周前'
            }
        ];
        
        this.init();
    }

    init() {
        this.loadUserProfile();
        this.loadRecentActivities();
        this.bindEvents();
    }

    // 加载用户资料
    loadUserProfile() {
        document.getElementById('userName').textContent = this.currentUser.name;
        document.getElementById('userEmail').textContent = this.currentUser.email;
        document.getElementById('userRole').textContent = this.currentUser.role;
        document.getElementById('userAvatar').src = this.currentUser.avatar;
        
        document.getElementById('ideasCount').textContent = this.currentUser.ideasCount;
        document.getElementById('projectsCount').textContent = this.currentUser.projectsCount;
        document.getElementById('pointsCount').textContent = this.currentUser.pointsCount;
    }

    // 加载最近活动
    loadRecentActivities() {
        const activityList = document.getElementById('activityList');
        if (!activityList) return;

        activityList.innerHTML = this.recentActivities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">${activity.icon}</div>
                <div class="activity-content">
                    <p><strong>${activity.content}</strong></p>
                    <span class="activity-time">${activity.time}</span>
                </div>
            </div>
        `).join('');
    }

    // 绑定事件
    bindEvents() {
        // 编辑资料按钮
        const editBtn = document.querySelector('.edit-profile-btn');
        if (editBtn) {
            editBtn.addEventListener('click', () => this.editProfile());
        }

        // 模态框关闭
        const modal = document.getElementById('editProfileModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeEditProfile();
                }
            });
        }

        // ESC键关闭模态框
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeEditProfile();
            }
        });
    }

    // 显示我的创意
    showMyIdeas() {
        // 模拟跳转到我的创意页面
        alert('跳转到我的创意页面...\n\n功能开发中，敬请期待！');
        // 实际项目中可以使用：
        // window.location.href = '/my-ideas';
    }

    // 显示我的项目
    showMyProjects() {
        // 模拟跳转到我的项目页面
        alert('跳转到我的项目页面...\n\n功能开发中，敬请期待！');
        // 实际项目中可以使用：
        // window.location.href = '/my-projects';
    }

    // 显示设置页面
    showSettings() {
        // 模拟跳转到设置页面
        alert('跳转到账户设置页面...\n\n功能开发中，敬请期待！');
        // 实际项目中可以使用：
        // window.location.href = '/settings';
    }

    // 显示通知页面
    showNotifications() {
        // 模拟跳转到通知页面
        alert('跳转到消息通知页面...\n\n功能开发中，敬请期待！');
        // 实际项目中可以使用：
        // window.location.href = '/notifications';
    }

    // 编辑个人资料
    editProfile() {
        const modal = document.getElementById('editProfileModal');
        if (!modal) return;

        // 填充当前用户信息到表单
        document.getElementById('editName').value = this.currentUser.name;
        document.getElementById('editEmail').value = this.currentUser.email;
        document.getElementById('editPhone').value = this.currentUser.phone || '';
        document.getElementById('editBio').value = this.currentUser.bio || '';

        modal.style.display = 'block';
        
        // 添加动画效果
        setTimeout(() => {
            modal.style.opacity = '1';
        }, 10);
    }

    // 关闭编辑资料模态框
    closeEditProfile() {
        const modal = document.getElementById('editProfileModal');
        if (!modal) return;

        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }

    // 保存个人资料
    saveProfile() {
        const form = document.getElementById('profileForm');
        if (!form) return;

        const formData = new FormData(form);
        const updatedUser = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            bio: formData.get('bio')
        };

        // 验证表单
        if (!updatedUser.name || !updatedUser.email) {
            alert('请填写必填字段：姓名和邮箱');
            return;
        }

        // 验证邮箱格式
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(updatedUser.email)) {
            alert('请输入有效的邮箱地址');
            return;
        }

        // 更新用户信息
        Object.assign(this.currentUser, updatedUser);
        
        // 重新加载用户资料显示
        this.loadUserProfile();
        
        // 关闭模态框
        this.closeEditProfile();
        
        // 显示成功消息
        this.showSuccessMessage('个人资料更新成功！');
        
        // 在实际项目中，这里应该发送API请求保存到服务器
        console.log('保存用户资料:', updatedUser);
    }

    // 显示成功消息
    showSuccessMessage(message) {
        // 创建成功提示元素
        const successDiv = document.createElement('div');
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1001;
            font-size: 14px;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        `;
        successDiv.textContent = message;
        
        document.body.appendChild(successDiv);
        
        // 显示动画
        setTimeout(() => {
            successDiv.style.opacity = '1';
            successDiv.style.transform = 'translateX(0)';
        }, 100);
        
        // 3秒后自动消失
        setTimeout(() => {
            successDiv.style.opacity = '0';
            successDiv.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(successDiv);
            }, 300);
        }, 3000);
    }

    // 更新用户统计数据
    updateUserStats(stats) {
        if (stats.ideasCount !== undefined) {
            this.currentUser.ideasCount = stats.ideasCount;
            document.getElementById('ideasCount').textContent = stats.ideasCount;
        }
        
        if (stats.projectsCount !== undefined) {
            this.currentUser.projectsCount = stats.projectsCount;
            document.getElementById('projectsCount').textContent = stats.projectsCount;
        }
        
        if (stats.pointsCount !== undefined) {
            this.currentUser.pointsCount = stats.pointsCount;
            document.getElementById('pointsCount').textContent = stats.pointsCount;
        }
    }

    // 添加新的活动记录
    addActivity(activity) {
        this.recentActivities.unshift(activity);
        
        // 只保留最近5条记录
        if (this.recentActivities.length > 5) {
            this.recentActivities = this.recentActivities.slice(0, 5);
        }
        
        this.loadRecentActivities();
    }

    // 获取用户信息
    getUserInfo() {
        return { ...this.currentUser };
    }
}

// 全局函数，供HTML调用
function editProfile() {
    if (window.userCenter) {
        window.userCenter.editProfile();
    }
}

function closeEditProfile() {
    if (window.userCenter) {
        window.userCenter.closeEditProfile();
    }
}

function saveProfile() {
    if (window.userCenter) {
        window.userCenter.saveProfile();
    }
}

function showMyIdeas() {
    if (window.userCenter) {
        window.userCenter.showMyIdeas();
    }
}

function showMyProjects() {
    if (window.userCenter) {
        window.userCenter.showMyProjects();
    }
}

function showSettings() {
    if (window.userCenter) {
        window.userCenter.showSettings();
    }
}

function showNotifications() {
    if (window.userCenter) {
        window.userCenter.showNotifications();
    }
}

// 初始化用户中心
document.addEventListener('DOMContentLoaded', function() {
    window.userCenter = new UserCenter();
});