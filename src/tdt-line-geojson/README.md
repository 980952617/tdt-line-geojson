#### 主要类型定义：

- **LngLat**: 经纬度坐标类型 `[number, number]`
- **Pixel**: 像素坐标对象接口 `{x: number, y: number}`
- **LineItem**: 单条折线数据结构，包含坐标、样式和属性
- **LineGeoJsonOverlayOptions**: 折线覆盖物配置选项
- **GeoJsonObject**: 标准GeoJSON数据结构约束
- **LineClickResult**: 折线点击事件返回结果
- **LineGeoJsonOverlay**: 折线覆盖物实例接口

#### 核心函数：

- **CreateLineOverlay()**: 工厂函数，返回折线覆盖物构造函数

### index.js

核心实现代码，基于天地图Overlay扩展的折线绘制组件。

#### 主要功能：

- **Canvas绘制**: 使用HTML5 Canvas实现高性能折线绘制
- **GeoJSON支持**: 支持LineString、MultiLineString、Feature、FeatureCollection格式
- **样式配置**: 支持颜色、宽度、透明度、虚线样式等配置
- **事件交互**: 支持折线点击事件检测
- **性能优化**: 支持平滑曲线、层级控制、内存管理

#### 核心方法：

- **setData(geoJson)**: 更新折线数据
- **setStyle(styles)**: 更新样式配置
- **bindClickEvent(handler)**: 绑定点击事件
- **bringToFront()**: 将当前折线置顶显示
- **bringToBack()**: 将当前折线置底显示
- **show()**: 显示当前折线
- **hide()**: 隐藏当前折线

## 安装使用

### npm 安装

```bash
npm install tdt-line-geojson
```

### yarn 安装

```bash
yarn add tdt-line-geojson
```


### 导入方式

```javascript
// ES6模块导入
import CreateLineOverlay from 'tdt-line-geojson';
```

### 基本用法

```javascript
// 1. 创建折线覆盖物构造函数
const LineGeoJsonOverlay = CreateLineOverlay();

// 2. 准备GeoJSON数据
const geoJsonData = {
    type: 'LineString' || 'MultiLineString' || 'Feature' || 'FeatureCollection',
    properties: {
        color: '#3388ff', // 可在数据中动态设置颜色
        weight: 3, // 可在数据中动态设置宽度
        opacity: 0.8 // 可在数据中动态设置透明度
    },
    coordinates: [[116.403874, 39.914885], [116.406315, 39.921988]]
};

// 3. 创建折线覆盖物实例
const lineOverlay = new LineGeoJsonOverlay(geoJsonData, {
    color: '#3388ff',
    weight: 3,
    opacity: 0.8
});

// 4. 添加到地图
// map 是天地图地图实例
map.addOverlay(lineOverlay);
```

## 配置选项

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| color | string | '#3388ff' | 折线颜色 |
| weight | number | 3 | 折线宽度 |
| opacity | number | 1 | 透明度 |
| lineStyle | string | 'solid' | 线条样式：solid/dashed |
| dashArray | string | '5,5' | 虚线样式 |
| smooth | boolean | true | 是否平滑曲线 |
| minZoom | number | 1 | 最小显示层级 |
| maxZoom | number | 18 | 最大显示层级 |
| visible | boolean | true | 是否可见 |

## 事件处理

### 点击事件

```javascript
lineOverlay.bindClickEvent((event, result) => {
    console.log('点击了折线:', {
        像素坐标: result.pixel,
        经纬度: result.lnglat,
        属性: result.properties,
        折线数据: result.lineData
    });
});
```

## 数据格式

### 支持的GeoJSON类型

- **LineString**: 单条折线
- **MultiLineString**: 多条折线
- **Feature**: 单个要素
- **FeatureCollection**: 要素集合

### 坐标格式

```javascript
// 标准经纬度坐标
[116.403874, 39.914885]
```


## 性能特性

- **Canvas渲染**: 高性能的Canvas绘制，支持大量折线数据
- **内存管理**: 自动清理资源，防止内存泄漏
- **层级控制**: 支持按地图层级显示/隐藏
- **平滑曲线**: 支持贝塞尔曲线平滑效果

## 注意事项

1. 使用前需要确保已加载天地图JavaScript库
2. 折线数据必须是有效的GeoJSON格式
3. Canvas元素设置了`pointer-events: none`，不影响地图原生交互
4. 支持链式调用，便于代码组织

## 开发信息

- **作者**: WuBo
- **技术栈**: JavaScript + Canvas + 天地图API
- **依赖**: 天地图(Tianditu) JavaScript库