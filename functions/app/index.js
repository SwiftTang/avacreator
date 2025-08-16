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

// 导出云函数入口
exports.main = app;