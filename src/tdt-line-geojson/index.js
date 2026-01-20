/**
 * 折线覆盖物类基于Canvas实现，用于在地图上显示折线效果
 * @author WuBo
 */
const CreateLineOverlay = function LineGeoJsonOverlay() {
    if (!window.T) {
        throw new Error('请先加载 Tianditu 地图库');
    }
    return T.Overlay.extend({
        /**
         * 折线覆盖物默认配置选项
         * @property {String} color 折线颜色 默认为 '#3388ff'
         * @property {Number} weight 折线宽度 默认为 3
         * @property {Number} opacity 折线透明度 默认为 1
         * @property {String} lineStyle 折线样式 默认为 'solid'
         * @property {String} dashArray 虚线样式 默认为 '5, 5'
         * @property {Boolean} smooth 是否平滑折线 默认为 true
         * @property {Number} minZoom 最小显示层级 默认为 1
         * @property {Number} maxZoom 最大显示层级 默认为 18
         * @property {Boolean} visible 是否可见 默认为 true
         */
        options: {
            color: '#3388ff',
            weight: 3,
            opacity: 1,
            lineStyle: 'solid',
            dashArray: '5, 5',
            smooth: true,
            minZoom: 1,
            maxZoom: 18,
            visible: true
        },
        /**
         * 初始化折线覆盖物
         * @param {Object} geoJson GeoJSON格式的折线数据
         * @param {Object} options 配置选项
         */
        initialize: function (geoJson, options) {
            if (!isValidGeoJSON(geoJson)) {
                throw new Error('GeoJSON 数据类型错误');
            }
            this.geoJson = geoJson;
            T.setOptions(this, options);
            this._canvas = null;
            this._frame = null;
            this._redrawRequested = false;
            this._coordinates = this._extractCoordinates(geoJson);

            // 绑定this指向，防止回调丢失
            this._reset = this._reset.bind(this);
            this._draw = this._draw.bind(this);
            this._redraw = this._redraw.bind(this);
            this.update = this.update.bind(this);
        },

        /**
         * 官方标准方法：向地图上添加叠加物 (map.addOverlay时自动调用)
         */
        onAdd: function (map) {
            this._map = map;
            if (!this._isSupportCanvas()) {
                console.warn('当前浏览器不支持Canvas，折线覆盖物无法显示');
                return;
            }
            if (!this._canvas) {
                this._initCanvas();
            }

            this._map.getPanes().overlayPane.appendChild(this._canvas);

            this._map.on('moveend', this.update, this);
            this.update({ type: 'moveend' }); // 初始化立即绘制
        },
        /**
         *官方标准方法：移除叠加物，释放内存 (map.removeOverlay时自动调用)
         * 
         */
        onRemove: function () {
            if (this._canvas && this._canvas.parentNode) {
                this._canvas.parentNode.removeChild(this._canvas);
            }
            // 销毁动画帧，防止内存泄漏
            if (this._frame) {
                cancelAnimationFrame(this._frame);
                this._frame = null;
            }
            // 移除所有事件监听，彻底释放内存
            if (this._map) {
                this._map.off('moveend', this.update, this);
                this._map.off('click', this.bindClickEvent, this);
            }
            // 清空所有引用
            this._redrawRequested = false;
            this._canvas = null;
            this._map = null;
            this._coordinates = null;
        },
        /**
         * 官方标准方法：地图状态变化时调用，用于重绘折线
         * 
         */
        update: function (event) {
            if (!this._canvas || !this._map) return;
            if (event && event.type === 'moveend') {
                this._reset();
            }
        },
        /**
         * 官方标准方法：获取当前折线元素
         */
        getElement: function () {
            return this._canvas;
        },
        /**
         * 自定义方法：将折线 bringToFront
         */
        bringToFront: function () {
            if (this._canvas && this._canvas.parentNode) {
                this._canvas.style.zIndex = 9999;
                var parent = this._canvas.parentNode;
                parent.appendChild(this._canvas);
            }
            return this;
        },

        /**
         * 自定义方法：将折线 bringToBack
         */
        bringToBack: function () {
            if (this._canvas && this._canvas.parentNode) {
                this._canvas.style.zIndex = 100;
                var parent = this._canvas.parentNode;
                parent.insertBefore(this._canvas, parent.firstChild);
            }
            return this;
        },
        /**
         * 显示折线
         * @param {*} geoJson 
         * @returns 
         */
        show: function () {
            this.options.visible = true;
            this._reset();

        },
        /**
         * 隐藏折线
         * @returns 
         */
        hide: function () {
            this.options.visible = false;
            this._reset();
        },
        /**
         * 自定义方法：设置折线数据
         */
        setData: function (geoJson) {
            if (!isValidGeoJSON(geoJson)) {
                throw new Error('折线数据必须是一个有效的 GeoJSON 格式');
            }
            this.geoJson = geoJson;
            this._coordinates = this._extractCoordinates(geoJson);
            this._reset();
            return this;
        },
        /**
         * 自定义方法：设置折线样式
         */
        setStyle: function (styles) {
            T.setOptions(this, styles);
            this._canvas && (this._canvas.style.opacity = this.options.opacity);
            this._reset();
            return this;
        },
        /**
         * 自定义方法：获取当前折线数据
         */
        getData: function () {
            return this.geoJson;
        },

        /**
         * 私有方法：初始化折线元素
         */
        _initCanvas: function () {
            var canvas = this._canvas = document.createElement('canvas');
            canvas.className = 'tdt-linegeojson-layer';
            canvas.style.position = 'absolute';
            canvas.style.left = '0';
            canvas.style.top = '0';
            canvas.style.zIndex = '9999';
            canvas.style.pointerEvents = 'none'; // 不影响地图原生交互
            canvas.style.opacity = this.options.opacity;

            var size = this._map.getSize();
            this._canvas.style.width = size.x + "px";
            this._canvas.style.height = size.y + "px";
            this._canvas.width = size.x;
            this._canvas.height = size.y;
        },
        /**
         * 私有方法：从 GeoJSON 中提取坐标+完整属性
         */
        _extractCoordinates: function (geoJson) {
            var lineList = []; // 存储：[{coordinates:[], color:'', width:'', opacity:'', properties:{}, pixelPoints:[]}, ...]
            switch (geoJson.type) {
                case 'LineString':
                    const props = geoJson.properties || {};
                    lineList.push({
                        coordinates: geoJson.coordinates,
                        color: props.color || this.options.color,
                        width: props.width || this.options.weight,
                        opacity: props.opacity || this.options.opacity,
                        properties: props
                    });
                    break;
                case 'MultiLineString':
                    geoJson.coordinates.forEach(function (line) {
                        const props = geoJson.properties || {};
                        lineList.push({
                            coordinates: line,
                            color: props.color || this.options.color,
                            width: props.width || this.options.weight,
                            opacity: props.opacity || this.options.opacity,
                            properties: props
                        });
                    }, this);
                    break;
                case 'Feature':
                    if (geoJson.geometry.type === 'MultiLineString') {
                        geoJson.geometry.coordinates.forEach(function (line) {
                            const props = geoJson.properties || {};
                            lineList.push({
                                coordinates: line,
                                color: props.color || this.options.color,
                                width: props.width || this.options.weight,
                                opacity: props.opacity || this.options.opacity,
                                properties: props
                            });
                        }, this); // 修复：补全this指向
                    } else if (geoJson.geometry.type === 'LineString') {
                        const props = geoJson.properties || {};
                        lineList.push({
                            coordinates: geoJson.geometry.coordinates,
                            color: props.color || this.options.color,
                            width: props.width || this.options.weight,
                            opacity: props.opacity || this.options.opacity,
                            properties: props
                        });
                    }
                    break;
                case 'FeatureCollection':
                    geoJson.features.forEach(function (feature) {
                        if (feature.geometry && feature.geometry.type === 'LineString') {
                            const props = feature.properties || {};
                            lineList.push({
                                coordinates: feature.geometry.coordinates,
                                color: props.color || this.options.color,
                                width: props.width || this.options.weight,
                                opacity: props.opacity || this.options.opacity,
                                properties: props
                            });
                        } else if (feature.geometry && feature.geometry.type === 'MultiLineString') {
                            const props = feature.properties || {};
                            lineList.push({
                                coordinates: feature.geometry.coordinates,
                                color: props.color || this.options.color,
                                width: props.width || this.options.weight,
                                opacity: props.opacity || this.options.opacity,
                                properties: props 
                            });
                        }
                    }, this);
                    break;
            }
            return lineList;
        },

        /**
         * 私有方法：重置画布尺寸，适配窗口拉伸
         * @returns {void}
         */
        _reset: function () {
            if (!this._canvas || !this._map) return;
            var size = this._map.getSize();
            this._canvas.style.width = size.x + "px";
            this._canvas.style.height = size.y + "px";
            this._canvas.width = size.x;
            this._canvas.height = size.y;

            var currentBounds = this._map.getBounds();
            var { x: neX, y: neY } = this._map.lngLatToLayerPoint(currentBounds.getNorthEast())
            var { x: swX, y: swY } = this._map.lngLatToLayerPoint(currentBounds.getSouthWest())
            var h = swY - neY; // 高度 = 西南Y - 东北Y
            var w = neX - swX; // 宽度 = 东北X - 西南X

            this._canvas.style.width = w + 'px';
            this._canvas.style.height = h + 'px';
            this._canvas.style[this.CSS_TRANSFORM()] = 'translate(' + Math.round(swX) + 'px,' + Math.round(neY) + 'px)';
            this._draw();
        },
        // 【完全复制你的热力图】保留这个方法不变
        CSS_TRANSFORM: function () {
            var div = document.createElement('div');
            var props = [
                'transform',
                'WebkitTransform',
                'MozTransform',
                'OTransform',
                'msTransform'
            ];
            for (var i = 0; i < props.length; i++) {
                var prop = props[i];
                if (div.style[prop] !== undefined) {
                    return prop;
                }
            }
            return props[0];
        },
        /**
         * 私有方法：重绘折线
         * @returns {void}
         */
        _redraw: function () {
            if (!this._redrawRequested && this._canvas) {
                this._redrawRequested = true;
                this._frame = requestAnimationFrame(this._draw);
            }
        },

        /**
         * 私有方法：绘制折线
         * @returns {void}
         */
        _draw: function () {
            if (!this._map || !this._canvas || !this.options.visible) {
                this._redrawRequested = false;
                var ctx = this._canvas.getContext('2d');
                ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
                return;
            }
            this._redrawRequested = false;
            var ctx = this._canvas.getContext('2d');
            ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
            if (!this._coordinates || this._coordinates.length === 0) return;

            var zoom = this._map.getZoom();
            if (zoom < this.options.minZoom || zoom > this.options.maxZoom) return;

            for (var i = 0; i < this._coordinates.length; i++) {
                var lineData = this._coordinates[i];
                if (lineData.coordinates.length < 2) continue;
                this._drawLine(ctx, lineData.coordinates, lineData.color, lineData.width, lineData.opacity);
            }
        },

        /**
         * 私有方法：绘制单条折线
         * @param {CanvasRenderingContext2D} ctx - 画布上下文
         * @param {Array<Array<number>>} coordinates - 折线坐标数组
         * @returns {void}
         */
        _drawLine: function (ctx, coordinates, lineColor, lineWidth, lineOpacity) {
            ctx.save();
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = lineWidth;
            ctx.globalAlpha = lineOpacity;

            // 虚线样式容错处理
            if (this.options.lineStyle === 'dashed') {
                var dashArray = this.options.dashArray.split(',').map(function (item) {
                    var val = Number(item);
                    return isNaN(val) ? 5 : val;
                });
                ctx.setLineDash(dashArray);
            } else {
                ctx.setLineDash([]);
            }

            ctx.lineJoin = 'round'; // 拐点圆角，更美观
            ctx.lineCap = 'round';   // 首尾圆角，更美观
            ctx.beginPath();

            var firstPoint = true;
            var points = [];

            for (var i = 0; i < coordinates.length; i++) {
                var coord = coordinates[i];
                var lnglat = new T.LngLat(coord[0], coord[1]);
                var pixel = this._map.lngLatToContainerPoint(lnglat);
                points.push(pixel);
            }

            // 绘制平滑曲线/直线
            for (var j = 0; j < points.length; j++) {
                var pixel = points[j];
                if (firstPoint) {
                    ctx.moveTo(pixel.x, pixel.y);
                    firstPoint = false;
                } else {
                    var prevPixel = points[j - 1];
                    if (this.options.smooth && j < points.length - 1) {
                        var nextPixel = points[j + 1];
                        var cp1x = prevPixel.x + (pixel.x - prevPixel.x) / 2;
                        var cp1y = prevPixel.y + (pixel.y - prevPixel.y) / 2;
                        var cp2x = pixel.x - (nextPixel.x - pixel.x) / 2;
                        var cp2y = pixel.y - (nextPixel.y - pixel.y) / 2;
                        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, pixel.x, pixel.y);
                    } else {
                        ctx.lineTo(pixel.x, pixel.y);
                    }
                }
            }
            ctx.stroke();
            ctx.restore();
        },
        /**
         * 私有工具方法：计算点到线段的最短距离
         * @param {Object} p 点击的点 {x:数字, y:数字}
         * @param {Object} a 线段起点 {x:数字, y:数字}
         * @param {Object} b 线段终点 {x:数字, y:数字}
         * @returns {Number} 点到线段的距离
         */
        _pointIsNearLine: function (p, a, b) {
            var ax = b.x - a.x, ay = b.y - a.y;
            var bx = p.x - a.x, by = p.y - a.y;
            var dot = bx * ax + by * ay;
            if (dot <= 0) return Math.sqrt(bx * bx + by * by);
            var len = ax * ax + ay * ay;
            if (dot >= len) {
                bx = p.x - b.x;
                by = p.y - b.y;
                return Math.sqrt(bx * bx + by * by);
            }
            var r = dot / len;
            var cx = a.x + ax * r;
            var cy = a.y + ay * r;
            bx = p.x - cx;
            by = p.y - cy;
            return Math.sqrt(bx * bx + by * by);
        },
        /**
         * 私有方法：将经纬度坐标数组转为像素坐标数组
         * @param {Array} coordinates 经纬度数组 [[lng,lat],...]
         * @returns {Array} 像素坐标数组 [{x:数字,y:数字},...]
         */
        _getPixelPoints: function (coordinates) {
            var pixelPoints = [];
            for (var i = 0; i < coordinates.length; i++) {
                var lnglat = new T.LngLat(coordinates[i][0], coordinates[i][1]);
                pixelPoints.push(this._map.lngLatToContainerPoint(lnglat));
            }
            return pixelPoints;
        },
        /**
         * 私有方法：绑定Canvas事件【完美最终版】
         * @param {function} handler - 事件处理函数，参数为 (e, res) 
         * res = { pixel: {x,y}, lnglat: {lng,lat}, properties: {}, lineData: {} }
         * @returns {void}
         */
        bindClickEvent: function (handler) {
            if (!this._canvas || !this._map || typeof handler !== 'function' || !this.options.visible) return;
            this._map.on("click", function (e) {
                if (!this._canvas || !this._map || typeof handler !== 'function' || !this.options.visible) return;
                // 1. 获取点击的经纬度和像素坐标
                var lnglat = e.lnglat;
                var pixel = this._map.lngLatToContainerPoint(lnglat);
                var hitLine = null; // 命中的线段

                // 2. 遍历所有线段，判断是否点击命中
                for (var i = 0; i < this._coordinates.length; i++) {
                    var lineData = this._coordinates[i];
                    var pixelPoints = this._getPixelPoints(lineData.coordinates);
                    var lineWidth = lineData.width || 3;
                    var hitRange = lineWidth * 2; // 点击检测范围
                    // 3. 遍历当前线段的所有节点，检测距离
                    for (var j = 0; j < pixelPoints.length - 1; j++) {
                        var a = pixelPoints[j];
                        var b = pixelPoints[j + 1];
                        var distance = this._pointIsNearLine(pixel, a, b);
                        // 4. 距离小于检测范围，判定为命中
                        if (distance < hitRange) {
                            hitLine = lineData;
                            break;
                        }
                    }
                    if (hitLine) break;
                }

                // 5. 命中后执行回调，返回完整数据
                if (hitLine) {
                    this._map.getContainer().style.cursor = 'pointer';
                    handler.call(this, e, {
                        pixel: pixel,
                        lnglat: lnglat,
                        properties: hitLine.properties,
                        lineData: hitLine
                    });
                    setTimeout(() => {
                        this._map.getContainer().style.cursor = '';
                    }, 800);
                }
            }.bind(this));
        },
        /**
         * 私有方法：判断浏览器是否支持Canvas
         * @returns {boolean} - 如果浏览器支持Canvas则返回true，否则返回false
         */
        _isSupportCanvas: function () {
            var elem = document.createElement('canvas');
            return !!(elem.getContext && elem.getContext('2d'));
        }
    })
}
export default CreateLineOverlay;
const isValidGeoJSON = function isGeoJSON(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return false;
    }
    const isValidCoordinates = (coord) => {
        if (!Array.isArray(coord) || coord.length !== 2) return false;
        const [lng, lat] = coord;
        if (typeof lng !== 'number' || typeof lat !== 'number') return false;
        return lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90;
    };
    const isValidLineStringCoords = (coords) => {
        return Array.isArray(coords) && coords.length >= 2 && coords.every(isValidCoordinates);
    };
    const isValidMultiLineStringCoords = (coords) => {
        return Array.isArray(coords) && coords.length >= 1 && coords.every(isValidLineStringCoords);
    };
    const { type } = data;
    if (!type || typeof type !== 'string') {
        return false;
    }
    const validLineTypes = ['LineString', 'MultiLineString', 'Feature', 'FeatureCollection'];
    if (!validLineTypes.includes(type)) {
        return false;
    }
    switch (type) {
        // 单条线段
        case 'LineString':
            return isValidLineStringCoords(data.coordinates);
        // 多条线段
        case 'MultiLineString':
            return isValidMultiLineStringCoords(data.coordinates);
        // 包含线段的Feature
        case 'Feature':
            const { geometry, properties } = data;
            const isGeometryValid = geometry && ['LineString', 'MultiLineString'].includes(geometry.type) && isValidGeoJSON(geometry);
            const isPropertiesValid = properties === null || (typeof properties === 'object' && !Array.isArray(properties));
            return isGeometryValid && isPropertiesValid;
        // 包含线段Feature的集合
        case 'FeatureCollection':
            const { features } = data;
            return Array.isArray(features) && features.every(feature => isValidGeoJSON(feature));
        default:
            return false;
    }
};
