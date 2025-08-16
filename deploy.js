const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// 检查必要文件
function checkRequiredFiles() {
  const requiredFiles = ['.env', 'cloudbaserc.json'];
  
  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      console.error(`❌ ${file} 文件不存在，请先运行 npm run setup`);
      process.exit(1);
    }
  }
}

// 执行部署命令
function deploy() {
  console.log('🚀 开始部署到腾讯云开发...');
  
  checkRequiredFiles();
  
  // 构建项目
  exec('npm run build', (error, stdout, stderr) => {
    if (error) {
      console.log('⚠️ 构建步骤跳过或失败');
    }
    
    // 登录CloudBase
    exec('tcb login', (error, stdout, stderr) => {
      if (error) {
        console.error('❌ CloudBase 登录失败:', error);
        console.log('请确保已安装 @cloudbase/cli 并配置好密钥');
        return;
      }
      
      console.log('✅ CloudBase 登录成功');
      
      // 部署函数
      if (fs.existsSync('./functions')) {
        exec('tcb functions:deploy app', (error, stdout, stderr) => {
          if (error) {
            console.error('❌ 函数部署失败:', error);
          } else {
            console.log('✅ 函数部署成功');
            console.log(stdout);
          }
          
          deployStatic();
        });
      } else {
        deployStatic();
      }
    });
  });
}

// 部署静态资源
function deployStatic() {
  const staticDirs = ['./dist', './public', './build'];
  const existingDir = staticDirs.find(dir => fs.existsSync(dir));
  
  if (existingDir) {
    console.log(`📁 发现静态资源目录: ${existingDir}`);
    exec(`tcb hosting:deploy ${existingDir}`, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ 静态网站部署失败:', error);
      } else {
        console.log('✅ 静态网站部署成功');
        console.log(stdout);
      }
      
      console.log('🎉 部署完成！');
    });
  } else {
    console.log('📁 未找到静态资源目录，跳过静态网站部署');
    console.log('🎉 部署完成！');
  }
}

deploy();