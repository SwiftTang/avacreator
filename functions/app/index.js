const express = require('express');
const app = express();

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由
app.get('/', (req, res) => {
  res.json({
    message: '欢迎使用腾讯云开发！',
    timestamp: new Date().toISOString(),
    environment: 'CloudBase'
  });
});

app.get('/api/hello', (req, res) => {
  res.json({
    message: 'Hello from CloudBase Function!',
    data: {
      name: req.query.name || '访客',
      time: new Date().toLocaleString('zh-CN')
    }
  });
});

app.post('/api/data', (req, res) => {
  console.log('接收到数据:', req.body);
  res.json({
    success: true,
    message: '数据接收成功',
    received: req.body
  });
});

// 用户相关API
app.post('/api/user/profile', (req, res) => {
  const { userId, action } = req.body;
  
  console.log('用户操作:', { userId, action });
  
  // 模拟用户数据
  const mockUserData = {
    id: userId || 'user_demo',
    nickname: '创新达人',
    avatar: '👤',
    roles: ['创意者', '设计师'],
    level: '专业用户',
    experience: 1250,
    points: 2800,
    stats: {
      tasksCompleted: 15,
      projectsJoined: 3,
      pointsEarned: 2800,
      currentStreak: 7
    },
    achievements: ['首次登录', '连续签到7天', '完成首个任务']
  };
  
  res.json({
    success: true,
    message: '用户信息获取成功',
    data: mockUserData,
    timestamp: new Date().toISOString()
  });
});

// 用户签到API
app.post('/api/user/checkin', (req, res) => {
  const { userId } = req.body;
  
  console.log('用户签到:', userId);
  
  res.json({
    success: true,
    message: '签到成功！',
    data: {
      pointsEarned: 10,
      streakDays: 8,
      totalPoints: 2810
    },
    timestamp: new Date().toISOString()
  });
});

// 积分管理API
app.get('/api/points/rules', (req, res) => {
  const pointsRules = {
    daily: {
      checkin: 10,
      firstLogin: 20
    },
    tasks: {
      easy: 50,
      medium: 100,
      hard: 200,
      expert: 500
    },
    social: {
      invite: 100,
      share: 20,
      review: 30
    },
    exchange: {
      rate: 100, // 100积分 = 1元人民币
      minExchange: 1000 // 最低兑换1000积分
    }
  };
  
  res.json({
    success: true,
    data: pointsRules,
    message: '积分规则获取成功'
  });
});

// 用户等级API
app.get('/api/user/levels', (req, res) => {
  const levelSystem = {
    levels: [
      { name: '注册用户', minExp: 0, maxExp: 99, benefits: ['基础功能'] },
      { name: '初级用户', minExp: 100, maxExp: 499, benefits: ['基础功能', '初级任务'] },
      { name: '专业用户', minExp: 500, maxExp: 1999, benefits: ['基础功能', '初级任务', '专业任务'] },
      { name: '专家用户', minExp: 2000, maxExp: 4999, benefits: ['基础功能', '初级任务', '专业任务', '专家任务'] },
      { name: '大师用户', minExp: 5000, maxExp: 999999, benefits: ['全部功能', '大师特权', '优先支持'] }
    ],
    experienceRules: {
      dailyCheckin: 5,
      taskCompletion: 20,
      projectParticipation: 50,
      mentoring: 30
    }
  };
  
  res.json({
    success: true,
    data: levelSystem,
    message: '等级系统获取成功'
  });
});

// 导出云函数入口
exports.main = app;
