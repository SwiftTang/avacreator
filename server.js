const express = require('express');
const path = require('path');
const { exec } = require('child_process');
const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// 页面路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'dashboard.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 其他页面路由（暂时重定向到仪表板，后续实现具体页面）
const pageRoutes = ['/operations', '/profile', '/events', '/ideas', '/projects', '/tasks', '/products'];
pageRoutes.forEach(route => {
    app.get(route, (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'pages', 'dashboard.html'));
    });
});

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

// 检查端口是否被占用并启动服务器
function startServer() {
  const server = app.listen(PORT, () => {
    console.log(`🚀 本地开发服务器启动成功！`);
    console.log(`📱 访问地址: http://localhost:${PORT}`);
    console.log(`🔧 环境: 开发模式`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️  端口 ${PORT} 被占用，正在尝试重启...`);
      
      // 杀死占用端口的进程
      exec(`lsof -ti:${PORT} | xargs kill -9`, (error) => {
        if (error) {
          console.log(`❌ 无法杀死占用端口的进程: ${error.message}`);
          process.exit(1);
        } else {
          console.log(`✅ 已清理端口 ${PORT}，正在重新启动...`);
          
          // 等待2秒后重新启动
          setTimeout(() => {
            startServer();
          }, 2000);
        }
      });
    } else {
      console.error(`❌ 服务器启动失败: ${err.message}`);
      process.exit(1);
    }
  });

  return server;
}

// 启动服务器
startServer();

// 优雅关闭处理
process.on('SIGINT', () => {
  console.log('\n🛑 正在关闭服务器...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 正在关闭服务器...');
  process.exit(0);
});
