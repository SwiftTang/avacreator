// 创意中心JavaScript
class IdeasCenter {
    constructor() {
        this.currentUser = null;
        this.ideas = [];
        this.currentTab = 'submit';
        this.init();
    }

    init() {
        this.loadUserInfo();
        this.bindEvents();
        this.loadIdeas();
        this.checkAdminAccess();
        // 清除任何可能的无用提示
        this.clearUnwantedMessages();
    }

    clearUnwantedMessages() {
        // 移除可能存在的无用弹窗或提示
        const unwantedMessages = document.querySelectorAll('[class*="message"], [class*="alert"], [class*="notification"]');
        unwantedMessages.forEach(msg => {
            const text = msg.textContent || '';
            if (text.includes('localhost') || text.includes('登录成功') || text.includes('显示')) {
                msg.remove();
            }
        });

        // 清除可能的浏览器弹窗
        setTimeout(() => {
            const dialogs = document.querySelectorAll('dialog, [role="dialog"]');
            dialogs.forEach(dialog => {
                const text = dialog.textContent || '';
                if (text.includes('localhost') || text.includes('登录成功')) {
                    dialog.close && dialog.close();
                    dialog.remove();
                }
            });
        }, 100);
    }

    loadUserInfo() {
        // 模拟用户信息加载 - 设置为管理员用于测试
        this.currentUser = {
            id: 'admin001',
            name: '管理员',
            level: 'admin', // normal, active, core, admin
            points: 500,
            isAdmin: true
        };

        // 更新UI显示
        document.getElementById('userLevel').textContent = this.getUserLevelText(this.currentUser.level);
        document.getElementById('userPoints').textContent = `积分: ${this.currentUser.points}`;
    }

    getUserLevelText(level) {
        const levelMap = {
            'normal': '普通用户',
            'active': '活跃用户',
            'core': '核心用户',
            'admin': '管理员'
        };
        return levelMap[level] || '普通用户';
    }

    checkAdminAccess() {
        if (this.currentUser.level === 'admin') {
            this.currentUser.isAdmin = true;
            document.querySelector('.admin-only').style.display = 'block';
        }
    }

    bindEvents() {
        // 标签切换
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // 创意表单提交
        document.getElementById('ideaForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitIdea();
        });

        // 详细创意切换
        document.getElementById('detailedIdea').addEventListener('change', (e) => {
            document.getElementById('detailedFields').style.display = 
                e.target.checked ? 'block' : 'none';
        });

        // 筛选功能
        document.getElementById('statusFilter')?.addEventListener('change', () => {
            this.filterMyIdeas();
        });

        document.getElementById('searchIdeas')?.addEventListener('input', () => {
            this.filterMyIdeas();
        });

        // 管理筛选
        document.getElementById('manageStatusFilter')?.addEventListener('change', () => {
            this.filterManageIdeas();
        });

        document.getElementById('userLevelFilter')?.addEventListener('change', () => {
            this.filterManageIdeas();
        });

        document.getElementById('dateFilter')?.addEventListener('change', () => {
            this.filterManageIdeas();
        });

        // 侧边栏筛选功能
        document.getElementById('sidebarStatusFilter')?.addEventListener('change', () => {
            this.filterSidebarIdeas();
        });

        document.getElementById('sidebarCategoryFilter')?.addEventListener('change', () => {
            this.filterSidebarIdeas();
        });

        // 模态框事件
        this.bindModalEvents();

        // 退出登录
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });
    }

    bindModalEvents() {
        // 关闭模态框
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                e.target.closest('.modal').style.display = 'none';
            });
        });

        // 点击模态框外部关闭
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });

        // 审核按钮
        document.getElementById('adoptBtn')?.addEventListener('click', () => {
            this.setReviewAction('adopt');
        });

        document.getElementById('rejectBtn')?.addEventListener('click', () => {
            this.setReviewAction('reject');
        });

        // 提交审核
        document.getElementById('submitReview')?.addEventListener('click', () => {
            this.submitReview();
        });

        // 取消审核
        document.getElementById('cancelReview')?.addEventListener('click', () => {
            document.getElementById('reviewModal').style.display = 'none';
        });
    }

    switchTab(tabName) {
        // 更新标签状态
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // 更新内容显示
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');

        this.currentTab = tabName;

        // 加载对应数据
        if (tabName === 'list') {
            this.loadIdeasList();
            this.setupLayoutForUser();
        }
    }

    setupLayoutForUser() {
        const layout = document.querySelector('.ideas-layout');
        const reviewPanel = document.getElementById('ideasReview');
        
        console.log('设置用户布局，用户角色:', this.currentUser.level, '是否管理员:', this.currentUser.isAdmin);
        
        if (this.currentUser.isAdmin && this.currentUser.level === 'admin') {
            layout.classList.remove('no-review');
            reviewPanel.style.display = 'flex';
            console.log('显示管理员审核面板');
            
            // 添加审核统计显示
            this.updateReviewStats();
        } else {
            layout.classList.add('no-review');
            reviewPanel.style.display = 'none';
            console.log('隐藏审核面板 - 非管理员用户');
        }
    }

    updateReviewStats() {
        const pendingCount = this.ideas.filter(idea => idea.status === 'pending').length;
        const reviewHeader = document.querySelector('.review-header h3');
        if (reviewHeader && pendingCount > 0) {
            reviewHeader.innerHTML = `创意评审 <span style="background: #ffc107; color: #856404; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem; margin-left: 8px;">${pendingCount}</span>`;
        }
    }

    loadIdeasList() {
        this.renderSidebarIdeas(this.ideas);
        this.clearDetailView();
        this.clearReviewPanel();
    }

    renderSidebarIdeas(ideas) {
        const container = document.getElementById('ideasListSidebar');
        
        if (ideas.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>暂无创意</p>
                </div>
            `;
            return;
        }

        container.innerHTML = ideas.map(idea => `
            <div class="sidebar-idea-item ${idea.status}" data-idea-id="${idea.id}" onclick="ideasCenter.selectIdea('${idea.id}')">
                <div class="sidebar-idea-meta">
                    <span>${this.formatDate(idea.submitTime)}</span>
                    <span class="sidebar-idea-status status-${idea.status}">
                        ${this.getStatusText(idea.status)}
                    </span>
                </div>
                <h4 class="sidebar-idea-title">${idea.title}</h4>
                <p class="sidebar-idea-description">${idea.description}</p>
            </div>
        `).join('');
    }

    selectIdea(ideaId) {
        // 更新侧边栏选中状态
        document.querySelectorAll('.sidebar-idea-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-idea-id="${ideaId}"]`).classList.add('active');

        // 显示详情
        this.showIdeaDetail(ideaId);

        // 如果是管理员且创意待审核，显示评审面板
        if (this.currentUser.isAdmin) {
            const idea = this.ideas.find(i => i.id === ideaId);
            if (idea && idea.status === 'pending') {
                this.showReviewPanel(ideaId);
            } else {
                this.clearReviewPanel();
            }
        }
    }

    showIdeaDetail(ideaId) {
        const idea = this.ideas.find(i => i.id === ideaId);
        if (!idea) return;

        const container = document.getElementById('ideaDetailContent');
        
        container.innerHTML = `
            <div class="detail-header">
                <h2 class="detail-title">${idea.title}</h2>
                <div class="detail-meta">
                    <div class="detail-meta-item">
                        <span class="detail-meta-label">提交者:</span>
                        <span>${idea.userName} (${this.getUserLevelText(idea.userLevel)})</span>
                    </div>
                    <div class="detail-meta-item">
                        <span class="detail-meta-label">提交时间:</span>
                        <span>${this.formatDate(idea.submitTime)}</span>
                    </div>
                    <div class="detail-meta-item">
                        <span class="detail-meta-label">状态:</span>
                        <span class="idea-status status-${idea.status}">${this.getStatusText(idea.status)}</span>
                    </div>
                    <div class="detail-meta-item">
                        <span class="detail-meta-label">类别:</span>
                        <span>${this.getCategoryText(idea.category)}</span>
                    </div>
                    <div class="detail-meta-item">
                        <span class="detail-meta-label">积分:</span>
                        <span>${idea.points}</span>
                    </div>
                </div>
                ${idea.tags && idea.tags.length > 0 ? `
                    <div class="detail-tags">
                        ${idea.tags.map(tag => `<span class="detail-tag">${tag}</span>`).join('')}
                    </div>
                ` : ''}
            </div>

            <div class="detail-section">
                <h4>创意描述</h4>
                <p>${idea.description}</p>
            </div>

            ${idea.isDetailed ? `
                ${idea.targetAudience ? `
                    <div class="detail-section">
                        <h4>目标对象</h4>
                        <p>${idea.targetAudience}</p>
                    </div>
                ` : ''}
                ${idea.implementationScope ? `
                    <div class="detail-section">
                        <h4>实施范围</h4>
                        <p>${idea.implementationScope}</p>
                    </div>
                ` : ''}
                ${idea.expectedValue ? `
                    <div class="detail-section">
                        <h4>预期价值</h4>
                        <p>${idea.expectedValue}</p>
                    </div>
                ` : ''}
                ${idea.references ? `
                    <div class="detail-section">
                        <h4>参考资料</h4>
                        <p>${idea.references}</p>
                    </div>
                ` : ''}
                ${idea.competitorAnalysis ? `
                    <div class="detail-section">
                        <h4>竞品分析</h4>
                        <p>${idea.competitorAnalysis}</p>
                    </div>
                ` : ''}
            ` : ''}

            ${idea.feedback ? `
                <div class="detail-section">
                    <h4>审核反馈</h4>
                    <p>${idea.feedback}</p>
                </div>
            ` : ''}
        `;
    }

    showReviewPanel(ideaId) {
        const idea = this.ideas.find(i => i.id === ideaId);
        if (!idea || idea.status !== 'pending') return;

        const container = document.getElementById('reviewContent');
        this.currentReviewId = ideaId;
        this.reviewAction = null;

        container.innerHTML = `
            <div class="review-form">
                <div class="review-actions">
                    <button class="review-btn adopt" onclick="ideasCenter.setReviewAction('adopt')">
                        ✅ 采纳
                    </button>
                    <button class="review-btn reject" onclick="ideasCenter.setReviewAction('reject')">
                        ❌ 拒绝
                    </button>
                </div>

                <div class="review-form-group">
                    <label for="reviewFeedback">审核反馈 *</label>
                    <textarea id="reviewFeedback" rows="4" placeholder="请提供详细的审核意见和建议"></textarea>
                </div>

                <div class="review-form-group">
                    <label for="bonusPoints">额外奖励积分</label>
                    <input type="number" id="bonusPoints" min="0" max="50" value="0" placeholder="0-50分">
                </div>

                <button class="review-submit" onclick="ideasCenter.submitReview()" disabled>
                    提交审核
                </button>
            </div>
        `;
    }

    setReviewAction(action) {
        this.reviewAction = action;
        
        // 更新按钮状态
        document.querySelectorAll('.review-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`.review-btn.${action}`).classList.add('active');
        
        // 启用提交按钮
        document.querySelector('.review-submit').disabled = false;
    }

    clearDetailView() {
        const container = document.getElementById('ideaDetailContent');
        container.innerHTML = `
            <div class="empty-detail">
                <div class="empty-icon">💡</div>
                <h4>选择一个创意查看详情</h4>
                <p>从左侧列表中选择创意，在这里查看完整信息</p>
            </div>
        `;
    }

    clearReviewPanel() {
        const container = document.getElementById('reviewContent');
        container.innerHTML = `
            <div class="empty-review">
                <div class="empty-icon">⚖️</div>
                <h4>选择待审核创意</h4>
                <p>选择状态为"待审核"的创意进行评审</p>
            </div>
        `;
    }

    async submitIdea() {
        const formData = this.getFormData();
        
        if (!this.validateForm(formData)) {
            return;
        }

        try {
            // 显示提交中状态
            const submitBtn = document.querySelector('#ideaForm button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = '提交中...';
            submitBtn.disabled = true;

            // 模拟API调用
            await this.simulateApiCall();

            // 创建新创意对象
            const newIdea = {
                id: Date.now().toString(),
                title: formData.title,
                description: formData.description,
                category: formData.category,
                tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
                isDetailed: formData.isDetailed,
                targetAudience: formData.targetAudience,
                implementationScope: formData.implementationScope,
                expectedValue: formData.expectedValue,
                references: formData.references,
                competitorAnalysis: formData.competitorAnalysis,
                userId: this.currentUser.id,
                userName: this.currentUser.name,
                userLevel: this.currentUser.level,
                status: 'pending',
                submitTime: new Date().toISOString(),
                points: 0,
                feedback: ''
            };

            // 添加到创意列表
            this.ideas.push(newIdea);
            this.saveIdeas();

            // 重置表单
            document.getElementById('ideaForm').reset();
            document.getElementById('detailedFields').style.display = 'none';
            document.getElementById('detailedIdea').checked = false;

            // 显示成功消息
            this.showMessage('创意提交成功！等待管理员审核。', 'success');

            // 恢复按钮状态
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;

        } catch (error) {
            console.error('提交创意失败:', error);
            this.showMessage('提交失败，请重试。', 'error');
            
            // 恢复按钮状态
            const submitBtn = document.querySelector('#ideaForm button[type="submit"]');
            submitBtn.textContent = '提交创意';
            submitBtn.disabled = false;
        }
    }

    getFormData() {
        return {
            title: document.getElementById('ideaTitle').value.trim(),
            description: document.getElementById('ideaDescription').value.trim(),
            category: document.getElementById('ideaCategory').value,
            tags: document.getElementById('ideaTags').value.trim(),
            isDetailed: document.getElementById('detailedIdea').checked,
            targetAudience: document.getElementById('targetAudience').value.trim(),
            implementationScope: document.getElementById('implementationScope').value.trim(),
            expectedValue: document.getElementById('expectedValue').value.trim(),
            references: document.getElementById('references').value.trim(),
            competitorAnalysis: document.getElementById('competitorAnalysis').value.trim()
        };
    }

    validateForm(formData) {
        if (!formData.title) {
            this.showMessage('请输入创意标题', 'error');
            return false;
        }

        if (!formData.description) {
            this.showMessage('请输入创意简述', 'error');
            return false;
        }

        if (formData.title.length > 100) {
            this.showMessage('创意标题不能超过100个字符', 'error');
            return false;
        }

        if (formData.description.length > 500) {
            this.showMessage('创意简述不能超过500个字符', 'error');
            return false;
        }

        return true;
    }

    async loadIdeas() {
        // 从localStorage加载创意数据
        const savedIdeas = localStorage.getItem('cb005_ideas');
        if (savedIdeas) {
            this.ideas = JSON.parse(savedIdeas);
        } else {
            // 初始化示例数据
            this.ideas = this.getInitialIdeas();
            this.saveIdeas();
        }
    }

    saveIdeas() {
        localStorage.setItem('cb005_ideas', JSON.stringify(this.ideas));
    }

    getInitialIdeas() {
        return [
            {
                id: '1',
                title: '优化用户注册流程',
                description: '简化注册步骤，提高用户转化率',
                category: 'user',
                tags: ['用户体验', '转化率'],
                isDetailed: true,
                targetAudience: '新用户',
                implementationScope: '注册页面',
                expectedValue: '提高注册转化率20%',
                references: '',
                competitorAnalysis: '',
                userId: 'user456',
                userName: '李四',
                userLevel: 'active',
                status: 'adopted',
                submitTime: '2024-01-15T10:30:00Z',
                points: 23,
                feedback: '很好的建议，已采纳实施'
            },
            {
                id: '2',
                title: '增加夜间模式',
                description: '为应用添加深色主题，改善夜间使用体验',
                category: 'product',
                tags: ['界面设计', '用户体验'],
                isDetailed: false,
                userId: 'user789',
                userName: '王五',
                userLevel: 'normal',
                status: 'pending',
                submitTime: '2024-01-16T14:20:00Z',
                points: 0,
                feedback: ''
            }
        ];
    }

    loadMyIdeas() {
        const myIdeas = this.ideas.filter(idea => idea.userId === this.currentUser.id);
        this.updateMyIdeasStats(myIdeas);
        this.renderMyIdeas(myIdeas);
    }

    updateMyIdeasStats(ideas) {
        const total = ideas.length;
        const adopted = ideas.filter(idea => idea.status === 'adopted').length;
        const pending = ideas.filter(idea => idea.status === 'pending').length;
        const totalPoints = ideas.reduce((sum, idea) => sum + idea.points, 0);

        document.getElementById('totalIdeas').textContent = total;
        document.getElementById('adoptedIdeas').textContent = adopted;
        document.getElementById('pendingIdeas').textContent = pending;
        document.getElementById('earnedPoints').textContent = totalPoints;
    }

    renderMyIdeas(ideas) {
        const container = document.getElementById('myIdeasList');
        
        if (ideas.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>还没有提交创意</h3>
                    <p>点击"新建创意"开始提交您的第一个创意吧！</p>
                </div>
            `;
            return;
        }

        container.innerHTML = ideas.map(idea => `
            <div class="idea-item ${idea.status}">
                <div class="idea-header">
                    <h3 class="idea-title">${idea.title}</h3>
                    <span class="idea-status status-${idea.status}">
                        ${this.getStatusText(idea.status)}
                    </span>
                </div>
                <div class="idea-meta">
                    <span>提交时间: ${this.formatDate(idea.submitTime)}</span>
                    <span>类别: ${this.getCategoryText(idea.category)}</span>
                    <span>积分: ${idea.points}</span>
                </div>
                <div class="idea-description">${idea.description}</div>
                ${idea.feedback ? `<div class="idea-feedback"><strong>反馈:</strong> ${idea.feedback}</div>` : ''}
                <div class="idea-actions">
                    <button class="btn-small btn-primary" onclick="ideasCenter.viewIdeaDetail('${idea.id}')">
                        查看详情
                    </button>
                    ${idea.status === 'pending' ? `
                        <button class="btn-small btn-secondary" onclick="ideasCenter.editIdea('${idea.id}')">
                            编辑
                        </button>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    filterMyIdeas() {
        const statusFilter = document.getElementById('statusFilter').value;
        const searchTerm = document.getElementById('searchIdeas').value.toLowerCase();
        
        let filteredIdeas = this.ideas.filter(idea => idea.userId === this.currentUser.id);
        
        if (statusFilter) {
            filteredIdeas = filteredIdeas.filter(idea => idea.status === statusFilter);
        }
        
        if (searchTerm) {
            filteredIdeas = filteredIdeas.filter(idea => 
                idea.title.toLowerCase().includes(searchTerm) ||
                idea.description.toLowerCase().includes(searchTerm)
            );
        }
        
        this.renderMyIdeas(filteredIdeas);
    }

    loadManageIdeas() {
        if (!this.currentUser.isAdmin) return;
        
        this.updateManageStats();
        this.renderManageIdeas(this.ideas);
    }

    updateManageStats() {
        const total = this.ideas.length;
        const pending = this.ideas.filter(idea => idea.status === 'pending').length;
        const adopted = this.ideas.filter(idea => idea.status === 'adopted').length;

        document.getElementById('totalSubmissions').textContent = total;
        document.getElementById('pendingReview').textContent = pending;
        document.getElementById('adoptedTotal').textContent = adopted;
    }

    renderManageIdeas(ideas) {
        const container = document.getElementById('manageIdeasList');
        
        if (ideas.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>暂无创意提交</h3>
                    <p>等待用户提交创意...</p>
                </div>
            `;
            return;
        }

        container.innerHTML = ideas.map(idea => `
            <div class="manage-idea-item ${idea.status}">
                <div class="manage-idea-header">
                    <h3 class="idea-title">${idea.title}</h3>
                    <span class="idea-status status-${idea.status}">
                        ${this.getStatusText(idea.status)}
                    </span>
                </div>
                <div class="manage-idea-info">
                    <div><strong>提交者:</strong> ${idea.userName}</div>
                    <div><strong>用户等级:</strong> ${this.getUserLevelText(idea.userLevel)}</div>
                    <div><strong>提交时间:</strong> ${this.formatDate(idea.submitTime)}</div>
                    <div><strong>类别:</strong> ${this.getCategoryText(idea.category)}</div>
                </div>
                <div class="idea-description">${idea.description}</div>
                ${idea.feedback ? `<div class="idea-feedback"><strong>审核反馈:</strong> ${idea.feedback}</div>` : ''}
                <div class="manage-actions">
                    <button class="btn-small btn-primary" onclick="ideasCenter.viewIdeaDetail('${idea.id}')">
                        查看详情
                    </button>
                    ${idea.status === 'pending' ? `
                        <button class="btn-small btn-success" onclick="ideasCenter.reviewIdea('${idea.id}')">
                            审核
                        </button>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    filterManageIdeas() {
        const statusFilter = document.getElementById('manageStatusFilter').value;
        const levelFilter = document.getElementById('userLevelFilter').value;
        const dateFilter = document.getElementById('dateFilter').value;
        
        let filteredIdeas = [...this.ideas];
        
        if (statusFilter) {
            filteredIdeas = filteredIdeas.filter(idea => idea.status === statusFilter);
        }
        
        if (levelFilter) {
            filteredIdeas = filteredIdeas.filter(idea => idea.userLevel === levelFilter);
        }
        
        if (dateFilter) {
            const filterDate = new Date(dateFilter);
            filteredIdeas = filteredIdeas.filter(idea => {
                const ideaDate = new Date(idea.submitTime);
                return ideaDate.toDateString() === filterDate.toDateString();
            });
        }
        
        this.renderManageIdeas(filteredIdeas);
    }

    viewIdeaDetail(ideaId) {
        const idea = this.ideas.find(i => i.id === ideaId);
        if (!idea) return;

        const modal = document.getElementById('ideaModal');
        const detailsContainer = document.getElementById('ideaDetails');
        
        detailsContainer.innerHTML = `
            <h2>${idea.title}</h2>
            <div class="idea-detail-meta">
                <p><strong>提交者:</strong> ${idea.userName} (${this.getUserLevelText(idea.userLevel)})</p>
                <p><strong>提交时间:</strong> ${this.formatDate(idea.submitTime)}</p>
                <p><strong>状态:</strong> ${this.getStatusText(idea.status)}</p>
                <p><strong>类别:</strong> ${this.getCategoryText(idea.category)}</p>
                ${idea.tags.length > 0 ? `<p><strong>标签:</strong> ${idea.tags.join(', ')}</p>` : ''}
                <p><strong>获得积分:</strong> ${idea.points}</p>
            </div>
            <div class="idea-detail-content">
                <h3>创意描述</h3>
                <p>${idea.description}</p>
                
                ${idea.isDetailed ? `
                    ${idea.targetAudience ? `<h3>目标对象</h3><p>${idea.targetAudience}</p>` : ''}
                    ${idea.implementationScope ? `<h3>实施范围</h3><p>${idea.implementationScope}</p>` : ''}
                    ${idea.expectedValue ? `<h3>预期价值</h3><p>${idea.expectedValue}</p>` : ''}
                    ${idea.references ? `<h3>参考资料</h3><p>${idea.references}</p>` : ''}
                    ${idea.competitorAnalysis ? `<h3>竞品分析</h3><p>${idea.competitorAnalysis}</p>` : ''}
                ` : ''}
                
                ${idea.feedback ? `<h3>审核反馈</h3><p>${idea.feedback}</p>` : ''}
            </div>
        `;
        
        modal.style.display = 'block';
    }

    reviewIdea(ideaId) {
        if (!this.currentUser.isAdmin) return;
        
        this.currentReviewId = ideaId;
        const modal = document.getElementById('reviewModal');
        
        // 重置表单
        document.getElementById('reviewFeedback').value = '';
        document.getElementById('bonusPoints').value = '0';
        
        modal.style.display = 'block';
    }

    setReviewAction(action) {
        this.reviewAction = action;
        
        // 更新按钮状态
        document.getElementById('adoptBtn').classList.toggle('active', action === 'adopt');
        document.getElementById('rejectBtn').classList.toggle('active', action === 'reject');
    }

    async submitReview() {
        if (!this.reviewAction || !this.currentReviewId) return;
        
        const feedback = document.getElementById('reviewFeedback').value.trim();
        const bonusPoints = parseInt(document.getElementById('bonusPoints').value) || 0;
        
        if (!feedback) {
            this.showMessage('请提供审核反馈', 'error');
            return;
        }

        try {
            const idea = this.ideas.find(i => i.id === this.currentReviewId);
            if (!idea) return;

            // 更新创意状态
            idea.status = this.reviewAction === 'adopt' ? 'adopted' : 'rejected';
            idea.feedback = feedback;
            idea.reviewTime = new Date().toISOString();

            // 计算积分
            if (this.reviewAction === 'adopt') {
                const basePoints = this.getBasePoints(idea.userLevel);
                const detailBonus = idea.isDetailed ? this.getDetailBonus(idea.userLevel) : 0;
                idea.points = basePoints + detailBonus + bonusPoints;
            }

            // 保存更改
            this.saveIdeas();

            // 关闭模态框
            document.getElementById('reviewModal').style.display = 'none';

            // 刷新管理列表
            this.loadManageIdeas();

            // 显示成功消息
            this.showMessage(`创意已${this.reviewAction === 'adopt' ? '采纳' : '拒绝'}`, 'success');

        } catch (error) {
            console.error('审核失败:', error);
            this.showMessage('审核失败，请重试', 'error');
        }
    }

    getBasePoints(userLevel) {
        const pointsMap = {
            'normal': 10,
            'active': 15,
            'core': 20,
            'admin': 25
        };
        return pointsMap[userLevel] || 10;
    }

    getDetailBonus(userLevel) {
        const bonusMap = {
            'normal': 5,
            'active': 8,
            'core': 10,
            'admin': 12
        };
        return bonusMap[userLevel] || 5;
    }

    getStatusText(status) {
        const statusMap = {
            'pending': '待审核',
            'adopted': '已采纳',
            'rejected': '未采纳'
        };
        return statusMap[status] || '未知';
    }

    getCategoryText(category) {
        const categoryMap = {
            'platform': '平台优化',
            'product': '产品改进',
            'user': '用户体验',
            'business': '商业模式',
            'technology': '技术创新',
            'other': '其他'
        };
        return categoryMap[category] || '未分类';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    showMessage(message, type = 'info') {
        // 只在必要时显示消息，避免无用提示
        if (!message || message.includes('localhost') || message.includes('登录成功')) {
            return;
        }
        
        // 创建消息元素
        const messageEl = document.createElement('div');
        messageEl.className = `message message-${type}`;
        messageEl.textContent = message;
        
        // 添加样式
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        // 设置背景色
        const colors = {
            'success': '#28a745',
            'error': '#dc3545',
            'warning': '#ffc107',
            'info': '#17a2b8'
        };
        messageEl.style.backgroundColor = colors[type] || colors.info;
        
        // 添加到页面
        document.body.appendChild(messageEl);
        
        // 3秒后自动移除
        setTimeout(() => {
            messageEl.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(messageEl)) {
                    document.body.removeChild(messageEl);
                }
            }, 300);
        }, 3000);
    }

    async simulateApiCall() {
        // 模拟API调用延迟
        return new Promise(resolve => setTimeout(resolve, 1000));
    }

    logout() {
        if (confirm('确定要退出登录吗？')) {
            // 清除用户数据
            localStorage.removeItem('cb005_user');
            // 跳转到登录页
            window.location.href = '../index.html';
        }
    }

    filterSidebarIdeas() {
        const statusFilter = document.getElementById('sidebarStatusFilter')?.value || '';
        const categoryFilter = document.getElementById('sidebarCategoryFilter')?.value || '';
        
        let filteredIdeas = [...this.ideas];
        
        if (statusFilter) {
            filteredIdeas = filteredIdeas.filter(idea => idea.status === statusFilter);
        }
        
        if (categoryFilter) {
            filteredIdeas = filteredIdeas.filter(idea => idea.category === categoryFilter);
        }
        
        this.renderSidebarIdeas(filteredIdeas);
        this.clearDetailView();
        this.clearReviewPanel();
    }

    editIdea(ideaId) {
        // 编辑创意功能 - 可以后续实现
        this.showMessage('编辑功能开发中...', 'info');
    }

    // 测试函数：切换用户角色
    toggleUserRole() {
        if (this.currentUser.level === 'admin') {
            this.currentUser = {
                id: 'user123',
                name: '普通用户',
                level: 'normal',
                points: 150,
                isAdmin: false
            };
        } else {
            this.currentUser = {
                id: 'admin001',
                name: '管理员',
                level: 'admin',
                points: 500,
                isAdmin: true
            };
        }
        
        // 更新UI显示
        document.getElementById('userLevel').textContent = this.getUserLevelText(this.currentUser.level);
        document.getElementById('userPoints').textContent = `积分: ${this.currentUser.points}`;
        
        // 重新设置布局
        this.setupLayoutForUser();
        
        this.showMessage(`已切换为${this.currentUser.name}`, 'info');
    }

    updateReviewStats() {
        const pendingCount = this.ideas.filter(idea => idea.status === 'pending').length;
        const reviewHeader = document.querySelector('.review-header h3');
        if (reviewHeader && pendingCount > 0) {
            reviewHeader.innerHTML = `创意评审 <span style="background: #ffc107; color: #856404; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem; margin-left: 8px;">${pendingCount}</span>`;
        }
    }
}

// 初始化创意中心
const ideasCenter = new IdeasCenter();

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
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
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .btn-success.active,
    .btn-danger.active {
        opacity: 0.7;
        transform: scale(0.95);
    }
    
    .idea-feedback {
        background: #f8f9fa;
        padding: 10px;
        border-radius: 6px;
        margin: 10px 0;
        border-left: 4px solid #17a2b8;
    }
    
    .idea-detail-meta {
        background: #f8f9fa;
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 20px;
    }
    
    .idea-detail-meta p {
        margin: 5px 0;
    }
    
    .idea-detail-content h3 {
        color: #667eea;
        margin-top: 20px;
        margin-bottom: 10px;
    }
`;
document.head.appendChild(style);
