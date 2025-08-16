#!/usr/bin/env node

/**
 * AVACreator 版本回退工具
 * 支持回退到指定版本，如 "回退到1.01版本"
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 版本映射表 - 将版本号映射到Git提交哈希
const VERSION_MAP = {
    '1.01': 'b1f59e7',  // UI优化与登录系统升级
    '1.0.0': '97e75bf', // 首个正式版本
    '1.00': '97e75bf',  // 首个正式版本（别名）
};

// 颜色输出函数
const colors = {
    red: (text) => `\x1b[31m${text}\x1b[0m`,
    green: (text) => `\x1b[32m${text}\x1b[0m`,
    yellow: (text) => `\x1b[33m${text}\x1b[0m`,
    blue: (text) => `\x1b[34m${text}\x1b[0m`,
    cyan: (text) => `\x1b[36m${text}\x1b[0m`,
    bold: (text) => `\x1b[1m${text}\x1b[0m`
};

function log(message, color = 'cyan') {
    console.log(colors[color](`🔄 ${message}`));
}

function error(message) {
    console.error(colors.red(`❌ 错误: ${message}`));
}

function success(message) {
    console.log(colors.green(`✅ ${message}`));
}

function warning(message) {
    console.log(colors.yellow(`⚠️  ${message}`));
}

// 显示可用版本
function showAvailableVersions() {
    console.log(colors.bold('\n📋 可用版本列表:'));
    console.log('─'.repeat(50));
    
    Object.entries(VERSION_MAP).forEach(([version, commit]) => {
        console.log(`${colors.cyan(version.padEnd(8))} → ${colors.yellow(commit)} ${getVersionDescription(version)}`);
    });
    
    console.log('─'.repeat(50));
    console.log(colors.blue('💡 使用方法: node rollback.js <版本号>'));
    console.log(colors.blue('💡 示例: node rollback.js 1.01'));
}

// 获取版本描述
function getVersionDescription(version) {
    const descriptions = {
        '1.01': '(UI优化与登录系统)',
        '1.0.0': '(首个正式版本)',
        '1.00': '(首个正式版本)'
    };
    return colors.blue(descriptions[version] || '');
}

// 检查Git状态
function checkGitStatus() {
    try {
        const status = execSync('git status --porcelain', { encoding: 'utf8' });
        if (status.trim()) {
            warning('检测到未提交的更改:');
            console.log(status);
            return false;
        }
        return true;
    } catch (err) {
        error('无法检查Git状态: ' + err.message);
        return false;
    }
}

// 获取当前分支
function getCurrentBranch() {
    try {
        return execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    } catch (err) {
        error('无法获取当前分支: ' + err.message);
        return null;
    }
}

// 获取当前提交哈希
function getCurrentCommit() {
    try {
        return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim().substring(0, 7);
    } catch (err) {
        error('无法获取当前提交: ' + err.message);
        return null;
    }
}

// 创建备份分支
function createBackupBranch() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
    const backupBranch = `backup-${timestamp}`;
    
    try {
        execSync(`git checkout -b ${backupBranch}`, { stdio: 'pipe' });
        execSync('git checkout main', { stdio: 'pipe' });
        success(`已创建备份分支: ${backupBranch}`);
        return backupBranch;
    } catch (err) {
        error('创建备份分支失败: ' + err.message);
        return null;
    }
}

// 执行回退
function rollbackToVersion(version) {
    const targetCommit = VERSION_MAP[version];
    
    if (!targetCommit) {
        error(`未找到版本 ${version}`);
        showAvailableVersions();
        return false;
    }
    
    log(`准备回退到版本 ${version} (${targetCommit})`);
    
    // 检查Git状态
    if (!checkGitStatus()) {
        error('请先提交或暂存当前更改');
        return false;
    }
    
    const currentBranch = getCurrentBranch();
    const currentCommit = getCurrentCommit();
    
    if (!currentBranch || !currentCommit) {
        return false;
    }
    
    log(`当前分支: ${currentBranch}`);
    log(`当前提交: ${currentCommit}`);
    
    // 创建备份分支
    const backupBranch = createBackupBranch();
    if (!backupBranch) {
        return false;
    }
    
    try {
        // 执行回退
        log(`正在回退到提交 ${targetCommit}...`);
        execSync(`git reset --hard ${targetCommit}`, { stdio: 'inherit' });
        
        success(`成功回退到版本 ${version}!`);
        console.log('');
        console.log(colors.bold('📋 回退信息:'));
        console.log(`   版本: ${colors.cyan(version)}`);
        console.log(`   提交: ${colors.yellow(targetCommit)}`);
        console.log(`   备份: ${colors.green(backupBranch)}`);
        console.log('');
        
        warning('注意事项:');
        console.log(`• 如需恢复，请运行: git checkout ${backupBranch}`);
        console.log('• 如需推送到远程，请运行: git push --force-with-lease origin main');
        console.log('• 备份分支包含了回退前的所有更改');
        
        return true;
        
    } catch (err) {
        error('回退失败: ' + err.message);
        
        // 尝试恢复
        try {
            execSync(`git checkout ${backupBranch}`, { stdio: 'pipe' });
            execSync('git checkout main', { stdio: 'pipe' });
            execSync(`git merge ${backupBranch}`, { stdio: 'pipe' });
            execSync(`git branch -d ${backupBranch}`, { stdio: 'pipe' });
            warning('已恢复到回退前状态');
        } catch (restoreErr) {
            error('恢复失败，请手动检查Git状态');
        }
        
        return false;
    }
}

// 主函数
function main() {
    console.log(colors.bold('🚀 AVACreator 版本回退工具\n'));
    
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        showAvailableVersions();
        return;
    }
    
    const targetVersion = args[0];
    
    // 支持多种输入格式
    const normalizedVersion = targetVersion.replace(/^v?/, ''); // 移除可选的 'v' 前缀
    
    if (rollbackToVersion(normalizedVersion)) {
        console.log(colors.green('\n🎉 版本回退完成!'));
    } else {
        console.log(colors.red('\n💥 版本回退失败!'));
        process.exit(1);
    }
}

// 处理命令行参数
if (require.main === module) {
    main();
}

module.exports = {
    rollbackToVersion,
    VERSION_MAP,
    showAvailableVersions
};