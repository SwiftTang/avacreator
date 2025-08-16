const fs = require('fs');
const path = require('path');

// 简单的CSV解析函数
function parseCSV(csvContent) {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length < 2) {
    throw new Error('CSV文件格式不正确');
  }
  
  const headers = lines[0].split(',').map(h => h.trim());
  const values = lines[1].split(',').map(v => v.trim());
  
  const result = {};
  headers.forEach((header, index) => {
    if (values[index]) {
      result[header] = values[index];
    }
  });
  
  return result;
}

// 读取CSV文件并设置环境变量
function setupCredentials() {
  const csvPath = path.join(__dirname, 'SecretKey.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.error('❌ SecretKey.csv 文件不存在');
    process.exit(1);
  }

  try {
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const credentials = parseCSV(csvContent);
    
    // 创建.env文件
    let envContent = '';
    Object.entries(credentials).forEach(([key, value]) => {
      envContent += `${key}=${value}\n`;
    });
    
    fs.writeFileSync('.env', envContent);
    console.log('✅ 环境变量配置完成');
    console.log('📋 配置内容:');
    Object.keys(credentials).forEach(key => {
      console.log(`   ${key}: ${credentials[key].substring(0, 8)}...`);
    });
    
    // 更新cloudbaserc.json配置文件
    const cloudbaseConfig = {
      envId: credentials.ENV_ID || 'your-env-id',
      functionRoot: './functions',
      functions: [
        {
          name: 'app',
          timeout: 5,
          envVariables: {},
          runtime: 'Nodejs16.13',
          memorySize: 128,
          handler: 'index.main'
        }
      ],
      framework: {
        name: 'express',
        plugins: {}
      },
      hosting: {
        root: './public'
      }
    };
    
    fs.writeFileSync('cloudbaserc.json', JSON.stringify(cloudbaseConfig, null, 2));
    console.log('✅ CloudBase 配置文件更新完成');
    
  } catch (error) {
    console.error('❌ 读取CSV文件失败:', error.message);
    process.exit(1);
  }
}

setupCredentials();