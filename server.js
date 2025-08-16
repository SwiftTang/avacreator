const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// API 路由 (模拟云函数)
app.get('/api/hello', (req, res) => {
  res.json({
    message: 'Hello from Local Server!',
    data: {
      name: req.query.name || '访客',
      time: new Date().toLocaleString('zh-CN'),
      environment: 'Local Development'
    }
  });
});

app.post('/api/data', (req, res) => {
  console.log('接收到数据:', req.body);
  res.json({
    success: true,
    message: '数据接收成功',
    received: req.body,
    environment: 'Local Development'
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 本地开发服务器启动成功！`);
  console.log(`📱 访问地址: http://localhost:${PORT}`);
  console.log(`🔧 环境: 开发模式`);
});