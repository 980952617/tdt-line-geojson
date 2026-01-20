# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-01

### Added
- 初始版本发布
- 支持天地图(Tianditu) GeoJSON折线覆盖物
- 基于Canvas的高性能绘制
- 支持多种GeoJSON格式：LineString、MultiLineString、Feature、FeatureCollection
- 完整的样式配置选项
- 折线点击事件支持
- TypeScript类型定义
- 内存管理和性能优化

### Features
- Canvas渲染，支持大量折线数据
- 平滑曲线效果
- 层级控制显示/隐藏
- 虚线样式支持
- 链式调用API
- 完整的错误处理

### Technical
- 无外部依赖，轻量级实现
- 支持现代浏览器
- 兼容CommonJS和ES6模块
- 完整的TypeScript支持