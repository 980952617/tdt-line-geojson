@echo off
REM npm发布脚本（Windows版本）
REM 使用方法: publish.bat [patch|minor|major]

REM 检查是否已登录npm
npm whoami >nul 2>&1
if errorlevel 1 (
    echo 请先登录npm: npm login
    exit /b 1
)

REM 检查参数
if "%1"=="" (
    echo 使用方法: %0 [patch|minor|major]
    exit /b 1
)

if not "%1"=="patch" if not "%1"=="minor" if not "%1"=="major" (
    echo 使用方法: %0 [patch|minor|major]
    exit /b 1
)

REM 更新版本号
echo 更新版本号...
npm version %1

REM 构建（如果有需要）
echo 构建项目...
npm run build

REM 发布到npm
echo 发布到npm...
npm publish

echo 发布完成！