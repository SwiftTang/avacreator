const express = require('express');
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');

// 微信登录路由模块
const wechatRouter = express.Router();

// 存储用户数据（生产环境应使用数据库）
let users = [];

// 微信登录 - 获取授权URL
wechatRouter.get('/login', (req, res) => {
  const appId = process.env.WECHAT_APP_ID;
  const redirectUri = encodeURIComponent(process.env.WECHAT_REDIRECT_URI);
  const state = Math.random().toString(36).substring(2, 15);
  
  if (!appId || !redirectUri) {
    return res.json({
      success: false,
      message: '微信登录配置不完整，请检查环境变量'
    });
  }
  
  // 构建微信授权URL
  const wechatAuthUrl = `https://open.weixin.qq.com/connect/qrconnect?appid=${appId}&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_login&state=${state}#wechat_redirect`;
  
  res.json({
    success: true,
    authUrl: wechatAuthUrl,
    state: state,
    message: '请在新窗口中完成微信登录'
  });
});

// 微信登录回调处理
wechatRouter.get('/callback', async (req, res) => {
  const { code, state } = req.query;
  
  if (!code) {
    return res.status(400).json({
      success: false,
      message: '授权失败，未获取到授权码'
    });
  }
  
  try {
    // 1. 通过code获取access_token
    const tokenUrl = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${process.env.WECHAT_APP_ID}&secret=${process.env.WECHAT_APP_SECRET}&code=${code}&grant_type=authorization_code`;
    
    const tokenResponse = await fetch(tokenUrl);
    const tokenData = await tokenResponse.json();
    
    if (tokenData.errcode) {
      console.error('获取access_token失败:', tokenData);
      return res.status(400).json({
        success: false,
        message: '获取访问令牌失败: ' + tokenData.errmsg
      });
    }
    
    // 2. 通过access_token获取用户信息
    const userUrl = `https://api.weixin.qq.com/sns/userinfo?access_token=${tokenData.access_token}&openid=${tokenData.openid}`;
    
    const userResponse = await fetch(userUrl);
    const userData = await userResponse.json();
    
    if (userData.errcode) {
      console.error('获取用户信息失败:', userData);
      return res.status(400).json({
        success: false,
        message: '获取用户信息失败: ' + userData.errmsg
      });
    }
    
    // 3. 处理用户登录逻辑
    const wechatUser = {
      openid: userData.openid,
      unionid: userData.unionid,
      nickname: userData.nickname,
      avatar: userData.headimgurl,
      sex: userData.sex === 1 ? '男' : userData.sex === 2 ? '女' : '未知',
      country: userData.country,
      province: userData.province,
      city: userData.city,
      loginTime: new Date().toISOString(),
      loginType: 'wechat'
    };
    
    // 4. 检查用户是否已存在
    let existingUser = users.find(u => u.openid === wechatUser.openid);
    
    if (!existingUser) {
      // 创建新用户
      const newUser = {
        id: users.length + 1,
        ...wechatUser,
        points: 120, // 新用户奖励120积分（注册20+微信登录100）
        experience: 0,
        level: 'registered',
        roles: ['creator'],
        creditScore: 100,
        registerTime: new Date().toISOString(),
        isNewUser: true
      };
      
      users.push(newUser);
      existingUser = newUser;
      
      console.log('新用户注册:', newUser.nickname);
    } else {
      // 更新现有用户信息
      existingUser.nickname = wechatUser.nickname;
      existingUser.avatar = wechatUser.avatar;
      existingUser.loginTime = wechatUser.loginTime;
      existingUser.isNewUser = false;
      
      // 每日登录奖励（简化版，实际应检查日期）
      existingUser.points += 10;
      
      console.log('用户登录:', existingUser.nickname);
    }
    
    // 5. 生成JWT token
    const token = jwt.sign(
      { 
        userId: existingUser.id,
        openid: existingUser.openid,
        nickname: existingUser.nickname
      },
      process.env.JWT_SECRET || 'avacreator-secret-key',
      { expiresIn: '7d' }
    );
    
    // 6. 返回登录成功信息
    const responseData = {
      success: true,
      message: existingUser.isNewUser ? '微信登录成功，欢迎加入AVACreator！' : '欢迎回来！',
      user: {
        id: existingUser.id,
        nickname: existingUser.nickname,
        avatar: existingUser.avatar,
        points: existingUser.points,
        level: existingUser.level,
        roles: existingUser.roles,
        isNewUser: existingUser.isNewUser
      },
      token: token
    };
    
    // 7. 重定向到前端页面（携带token）
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3002';
    const redirectUrl = `${frontendUrl}?token=${token}&login=success`;
    
    res.redirect(redirectUrl);
    
  } catch (error) {
    console.error('微信登录错误:', error);
    res.status(500).json({
      success: false,
      message: '微信登录失败: ' + error.message
    });
  }
});

// 验证微信登录状态
wechatRouter.get('/verify', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: '未提供访问令牌'
    });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'avacreator-secret-key');
    const user = users.find(u => u.id === decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    res.json({
      success: true,
      user: {
        id: user.id,
        nickname: user.nickname,
        avatar: user.avatar,
        points: user.points,
        level: user.level,
        roles: user.roles
      }
    });
    
  } catch (error) {
    res.status(401).json({
      success: false,
      message: '访问令牌无效'
    });
  }
});

// 微信登录配置检查
wechatRouter.get('/config', (req, res) => {
  const config = {
    appId: process.env.WECHAT_APP_ID ? '已配置' : '未配置',
    appSecret: process.env.WECHAT_APP_SECRET ? '已配置' : '未配置',
    redirectUri: process.env.WECHAT_REDIRECT_URI || '未配置',
    jwtSecret: process.env.JWT_SECRET ? '已配置' : '未配置'
  };
  
  const isConfigured = config.appId === '已配置' && 
                      config.appSecret === '已配置' && 
                      config.redirectUri !== '未配置';
  
  res.json({
    success: true,
    configured: isConfigured,
    config: config,
    message: isConfigured ? '微信登录配置完整' : '微信登录配置不完整，请查看配置指南'
  });
});

module.exports = wechatRouter;