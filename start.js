#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const path = require('path');

const PORT = 3000;
const SERVER_FILE = path.join(__dirname, 'server.js');

console.log('🚀 AVACreator 服务器启动器');
console.log('=' .repeat(50));

// 检查并清理端口
function clearPort() {
    return new Promise((resolve) => {
        exec(`lsof -ti:${PORT}`, (error, stdout) => {
            if (stdout.trim()) {
                const pids = stdout.trim().split('\n');
                console.log(`⚠️  发现端口 ${PORT} 被占用，PID: ${pids.join(', ')}`);
                
                exec(`kill -9 ${pids.join(' ')}`, (killError) => {
                    if (killError) {
                        console.log(`❌ 清理端口失败: ${killError.message}`);
                    } else {
                        console.log(`✅ 已清理端口 ${PORT}`);
                    }
                    setTimeout(resolve, 1000); // 等待1秒确保端口释放
                });
            } else {
                console.log(`✅ 端口 ${PORT} 可用`);
                resolve();
            }
        });
    });
}

// 启动服务器
function startServer() {
    console.log('🔄 正在启动服务器...');
    
    const server = spawn('node', [SERVER_FILE], {
        stdio: 'inherit',
        cwd: __dirname
    });

    server.on('error', (err) => {
        console.error(`❌ 服务器启动失败: ${err.message}`);
        process.exit(1);
    });

    server.on('exit', (code, signal) => {
        if (signal === 'SIGINT' || signal === 'SIGTERM') {
            console.log('\n👋 服务器已正常关闭');
            process.exit(0);
        } else if (code !== 0) {
            console.log(`⚠️  服务器异常退出，代码: ${code}，正在重启...`);
            setTimeout(async () => {
                await clearPort();
                startServer();
            }, 2000);
        }
    });

    // 处理进程信号
    process.on('SIGINT', () => {
        console.log('\n🛑 收到中断信号，正在关闭服务器...');
        server.kill('SIGINT');
    });

    process.on('SIGTERM', () => {
        console.log('\n🛑 收到终止信号，正在关闭服务器...');
        server.kill('SIGTERM');
    });

    return server;
}

// 主启动流程
async function main() {
    try {
        // 清理端口
        await clearPort();
        
        // 启动服务器
        startServer();
        
    } catch (error) {
        console.error(`❌ 启动失败: ${error.message}`);
        process.exit(1);
    }
}

// 运行主程序
main();