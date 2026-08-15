
// 构建说明
// 1、cmd 环境下执行 [项目根目录下]
// powershell -ExecutionPolicy Bypass -File .\build.ps1

// 2、PowerShell 环境下执行 [项目根目录下]
// .\build.ps1


// 3、发布到 npm 方式[在core目录下执行]
// 首先 npm config set //registry.npmjs.org/:_authToken npm_O32xuONiyK43QqleE0crJ69 --no-workspaces   [中间参数是npm创建的秘钥]
// 然后 npm publish --no-workspaces


// github 代码推送说明
// ### . 创建 GitHub PAT
// 1. 打开 https://github.com/settings/tokens
// 2. 点击 Generate new token → 选 Classic
// 3. Note : 随便填，如 zdx-grid-push
// 4. Expiration : 选你需要的时长（建议 90 天或更长）
// 5. 权限勾选 repo （完整勾选 repo 整组） ⚠️ 这是关键
// 6. 点击底部 Generate token
// 7. 立即复制 token（只显示一次！格式类似 ghp_xxxxxxxxxxxx ）
// ### 2. 配置 Windows 凭据管理器（一次性配置）
// 按 Win → 搜 "凭据管理器" → 选 Windows 凭据 → 找到 git:https://github.com ：

// - 如果存在 → 点 编辑 → 密码改为 PAT
// - 如果不存在 → 点 添加普通凭据 →
//   - 网络地址： git:https://github.com
//   - 用户名：你的 GitHub 用户名 islittlezhou
//   - 密码：粘贴 PAT