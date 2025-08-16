# 腾讯云开发一键部署项目

这是一个支持一键部署到腾讯云开发（TCB）的完整项目模板，自动读取CSV配置文件中的身份信息。

## 🚀 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 配置环境
```bash
npm run setup
```
此命令会自动读取 `SecretKey.csv` 文件并生成环境配置。

### 3. 本地开发
```bash
npm run dev
```
访问 http://localhost:3001 查看项目

### 4. 一键部署
```bash
npm run deploy
```

## 📁 项目结构

```
├── package.json          # 项目配置
├── SecretKey.example.csv # 密钥配置模板
├── setup.js              # 环境配置脚本
├── deploy.js             # 部署脚本
├── server.js             # 本地开发服务器
├── cloudbaserc.json      # CloudBase配置文件
├── functions/            # 云函数目录
│   └── app/
│       ├── index.js      # 云函数入口
│       └── package.json  # 云函数依赖
└── public/               # 静态资源
    └── index.html        # 前端页面
```

## 🔧 配置说明

### 密钥配置
⚠️ **重要安全提示**: 敏感信息不会提交到 Git 仓库。

请复制 `SecretKey.example.csv` 为 `SecretKey.csv` 并填入你的真实密钥：

```csv
SecretId,SecretKey
YOUR_SECRET_ID,YOUR_SECRET_KEY
```

**安全建议**:
- 绝不要将真实的密钥提交到 Git 仓库
- 使用环境变量或密钥管理服务
- 定期轮换访问密钥

## 🌟 功能特性

- ✅ 自动读取CSV配置文件
- ✅ 一键部署到腾讯云开发
- ✅ Express云函数支持
- ✅ 静态网站托管
- ✅ 本地开发环境
- ✅ 环境变量自动配置

## 🛠️ 开发命令

- `npm run dev` - 启动本地开发服务器
- `npm run setup` - 配置环境变量
- `npm run deploy` - 一键部署到TCB
- `npm run build` - 构建项目（可选）

## 🔗 相关链接

- [腾讯云开发文档](https://cloud.tencent.com/document/product/876)
- [CloudBase CLI](https://docs.cloudbase.net/cli-v1/intro.html)
- [Express.js](https://expressjs.com/)