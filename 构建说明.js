
// 构建说明
// 1、cmd 环境下执行 [项目根目录下]
// powershell -ExecutionPolicy Bypass -File .\build.ps1

// 2、PowerShell 环境下执行 [项目根目录下]
// .\build.ps1


// 3、发布到 npm 方式[在core目录下执行]
// 首先 npm config set //registry.npmjs.org/:_authToken npm_O32xuONiyK43QqleE0crJ69 --no-workspaces   [中间参数是npm创建的秘钥]
// 然后 npm publish --no-workspaces