#!/bin/bash

# npm发布脚本
# 使用方法: ./publish.sh [patch|minor|major]

# 检查是否已登录npm
if ! npm whoami; then
    echo "请先登录npm: npm login"
    exit 1
fi

# 检查参数
if [ "$1" != "patch" ] && [ "$1" != "minor" ] && [ "$1" != "major" ]; then
    echo "使用方法: $0 [patch|minor|major]"
    exit 1
fi

# 更新版本号
echo "更新版本号..."
npm version $1

# 构建（如果有需要）
echo "构建项目..."
npm run build

# 发布到npm
echo "发布到npm..."
npm publish

echo "发布完成！"