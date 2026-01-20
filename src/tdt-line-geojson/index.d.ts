
/**
 * 经纬度坐标数据类型
 * @description 标准的[经度,纬度]二维数组，天地图/高德通用格式
 * @example [116.403874, 39.914885]
 */
export type LngLat = [number, number];

/**
 * 像素坐标对象类型
 * @description 地图容器内的像素坐标，由经纬度转换而来
 * @property x 横坐标值
 * @property y 纵坐标值
 */
export interface Pixel {
    x: number;
    y: number;
}

/**
 * 内部解析后的单条折线数据结构
 * @description GeoJSON解析后，每条折线的独立数据模型，含样式+坐标+属性
 * @property coordinates 折线的经纬度坐标数组
 * @property color 折线颜色
 * @property width 折线宽度
 * @property opacity 折线透明度
 * @property properties 折线的自定义属性集合
 * @property pixelPoints 可选，转换后的像素坐标数组
 */
export interface LineItem {
    coordinates: LngLat[];
    color: string;
    width: number;
    opacity: number;
    properties: Record<string, any>;
    pixelPoints?: Pixel[];
}

/**
 * 折线覆盖物的配置项完整类型
 * @description 与原生JS中的options默认配置完全一致，所有配置项均为可选
 * @property color 折线颜色，默认值: '#3388ff'
 * @property weight 折线宽度，默认值: 3
 * @property opacity 折线透明度，默认值: 1
 * @property lineStyle 折线样式，可选 solid(实线)/dashed(虚线)，默认值: 'solid'
 * @property dashArray 虚线样式配置，默认值: '5, 5'，仅lineStyle=dashed时生效
 * @property smooth 是否开启折线平滑，默认值: true
 * @property minZoom 折线最小显示地图层级，默认值: 1
 * @property maxZoom 折线最大显示地图层级，默认值: 18
 * @property visible 折线是否可见，默认值: true
 */
export interface LineGeoJsonOverlayOptions {
    color?: string;
    weight?: number;
    opacity?: number;
    lineStyle?: 'solid' | 'dashed';
    dashArray?: string;
    smooth?: boolean;
    minZoom?: number;
    maxZoom?: number;
    visible?: boolean;
}

/**
 * 标准GeoJSON数据结构类型约束
 * @description 适配原生JS的isValidGeoJSON校验规则，仅支持4种折线相关GeoJSON类型
 * @property type GeoJSON的类型 必填，仅支持 LineString/MultiLineString/Feature/FeatureCollection
 * @property coordinates 坐标集合，LineString/MultiLineString类型时存在
 * @property geometry 几何信息，Feature类型时存在
 * @property properties 自定义属性，Feature类型时存在
 * @property features 要素集合，FeatureCollection类型时存在
 */
export interface GeoJsonObject {
    type: 'LineString' | 'MultiLineString' | 'Feature' | 'FeatureCollection';
    coordinates?: LngLat[] | LngLat[][] | any;
    geometry?: { type: string; coordinates: any };
    properties?: Record<string, any>;
    features?: Array<{ geometry: any; properties?: Record<string, any> }>;
}

/**
 * 折线点击事件的回调返回结果完整类型
 * @description bindClickEvent事件触发后，回调函数的第二个参数完整数据模型
 * @property pixel 点击位置的像素坐标
 * @property lnglat 点击位置的经纬度坐标
 * @property properties 被点击折线的自定义属性
 * @property lineData 被点击折线的完整数据
 */
export interface LineClickResult {
    pixel: Pixel;
    lnglat: { lng: number; lat: number };
    properties: Record<string, any>;
    lineData: LineItem;
}

/**
 * 折线点击事件的回调函数类型
 * @param event 天地图原生的点击事件对象，包含地图原生事件信息
 * @param result 包含经纬度/像素坐标/折线数据等核心信息
 */
export type LineClickHandler = (event: Record<string, any>, result: LineClickResult) => void;

/**
 * 核心接口：折线覆盖物的实例对象完整类型
 * @description 包含折线覆盖物的所有公有属性+公有方法，与原生JS的原型方法一一对应
 */
export interface LineGeoJsonOverlay {
    /** 当前折线的GeoJSON数据源 */
    geoJson: GeoJsonObject;
    /** 当前折线的最终配置项（默认配置+用户传参合并后的结果） */
    options: LineGeoJsonOverlayOptions;
    /**
     * 获取当前折线的Canvas画布DOM元素
     * @returns Canvas元素对象 或 null(未初始化时)
     */
    getElement(): HTMLCanvasElement | null;
    /**
     * 将当前折线置顶显示
     * @returns 当前实例，支持链式调用
     */
    bringToFront(): this;
    /**
     * 将当前折线置底显示
     * @returns 当前实例，支持链式调用
     */
    bringToBack(): this;
    /**
     * 设置/更新折线的GeoJSON数据源
     * @param geoJson 新的GeoJSON格式数据源
     * @returns 当前实例，支持链式调用
     */
    setData(geoJson: GeoJsonObject): this;
    /**
     * 设置/更新折线的样式配置
     * @param styles 要修改的样式配置项（支持部分修改，无需传全量）
     * @returns 当前实例，支持链式调用
     */
    setStyle(styles: Partial<LineGeoJsonOverlayOptions>): this;
    /**
     * 绑定折线的点击事件（核心自定义方法）
     * @description 兼容Canvas的pointer-events:none，通过地图原生点击事件实现精准命中检测
     * @param handler 点击事件的回调处理函数
     */
    bindClickEvent(handler: LineClickHandler): void;
    /**
     * 显示折线
     * @returns 当前实例，支持链式调用
     */
    show(): void;
    /**
     * 隐藏折线
     * @returns 当前实例，支持链式调用
     */
    hide(): void;
}

/**
 * 折线覆盖物的构造函数类型
 * @description CreateLineOverlay()执行后返回的就是这个构造函数，new时传参即可创建实例
 * @param geoJson 必传，GeoJSON格式的折线数据源
 * @param options 可选，折线样式配置项
 * @returns 折线覆盖物的实例对象
 */
export type LineGeoJsonOverlayConstructor = new (geoJson: GeoJsonObject, options?: LineGeoJsonOverlayOptions) => LineGeoJsonOverlay;

/**
 * 核心工厂函数声明
 * @description 无参函数，执行后返回【折线覆盖物的构造函数】，完全匹配你的两步式调用逻辑
 * @example const LineGeoJsonOverlay = CreateLineOverlay(); const lineOverlay = new LineGeoJsonOverlay(geoJson)
 * @returns 折线覆盖物的构造函数 LineGeoJsonOverlayConstructor
 */
declare const CreateLineOverlay: () => LineGeoJsonOverlayConstructor;

/**
 * 独立工具函数：校验数据是否为合法的GeoJSON格式
 * @description 与原生JS中的isValidGeoJSON函数一一对应，全局独立函数
 * @param data 待校验的任意数据
 * @returns 布尔值：true=合法GeoJSON，false=非法GeoJSON
 */
declare function isValidGeoJSON(data: any): boolean;

// 导出所有需要外部使用的类型+变量+函数，按需导入即可
export { CreateLineOverlay, isValidGeoJSON, LineGeoJsonOverlayConstructor };
// 默认导出核心工厂函数，简化导入写法
export default CreateLineOverlay;