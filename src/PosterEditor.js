// src/PosterEditor.js
import {
  Canvas, FabricImage, Textbox, Rect, Circle,
  Triangle, Ellipse, Polygon, Line, Path,
  Group, ActiveSelection, IText, util,
  Pattern, Gradient, Shadow,
  PencilBrush, CircleBrush, SprayBrush
} from 'fabric';
import EventEmitter from './EventEmitter.js';
import { initCustomControls } from './customControl.js';

class PosterEditor extends EventEmitter {
  constructor(container, options = {}) {
    super();

    this.container = typeof container === 'string'
      ? document.getElementById(container)
      : container;

    this.options = {
      width: 800,
      height: 600,
      backgroundColor: '#ffffff',
      ...options
    };

    this.canvas = null;
    this.data = {
      version: process.env.PACKAGE_VERSION || '1.0.0',
      canvas: {
        width: this.options.width,
        height: this.options.height,
        backgroundColor: this.options.backgroundColor
      },
      objects: []
    };

    // 历史记录用于撤销/重做
    this.history = [];
    this.historyIndex = -1;
    this.historyMaxLength = 50;
    this.isHistoryProcessing = false;

    this.init();
  }

  init() {
    // 创建canvas元素
    const canvasEl = document.createElement('canvas');
    canvasEl.id = 'poster-canvas';
    canvasEl.width = this.options.width;
    canvasEl.height = this.options.height;
    this.container.appendChild(canvasEl);

    // 初始化fabric canvas
    this.canvas = new Canvas(canvasEl, {
      width: this.options.width,
      height: this.options.height,
      backgroundColor: this.options.backgroundColor
    });

    // 初始化自定义控制手柄
    initCustomControls();

    this.bindEvents();
    this.emit('initialized', { editor: this });
  }

  bindEvents() {
    // 对象添加事件
    this.canvas.on('object:added', (e) => {
      this.updateDataFromCanvas();
      this.emit('object:added', e);
    });

    // 对象修改事件
    this.canvas.on('object:modified', (e) => {
      this.updateDataFromCanvas();
      this.emit('object:modified', e);
    });

    // 对象移除事件
    this.canvas.on('object:removed', (e) => {
      this.updateDataFromCanvas();
      this.emit('object:removed', e);
    });

    // 选择事件
    this.canvas.on('selection:created', (e) => {
      this.emit('selection:created', e);
    });

    this.canvas.on('selection:updated', (e) => {
      this.emit('selection:updated', e);
    });

    this.canvas.on('selection:cleared', (e) => {
      this.emit('selection:cleared', e);
    });

    // 画布修改事件
    this.canvas.on('canvas:cleared', () => {
      this.updateDataFromCanvas();
      this.emit('canvas:cleared');
    });

    // 监听所有画布修改事件以支持历史记录
    this.canvas.on('object:modified', () => {
      if (!this.isHistoryProcessing) {
        this.saveToHistory();
      }
    });

    this.canvas.on('object:added', () => {
      if (!this.isHistoryProcessing) {
        this.saveToHistory();
      }
    });

    this.canvas.on('object:removed', () => {
      if (!this.isHistoryProcessing) {
        this.saveToHistory();
      }
    });
  }

  // 从canvas更新数据
  updateDataFromCanvas() {
    this.data.canvas = {
      width: this.canvas.width,
      height: this.canvas.height,
      backgroundColor: this.canvas.backgroundColor
    };

    this.data.objects = this.canvas.toObject().objects;
    this.emit('data:changed', { data: this.data });
  }

  // 从JSON数据更新canvas
  async loadFromJSON(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid JSON data');
    }

    this.data = { ...this.data, ...data };

    // 更新画布属性
    if (data.canvas) {
      this.canvas.setDimensions({
        width: data.canvas.width || this.canvas.width,
        height: data.canvas.height || this.canvas.height
      });

      if (data.canvas.backgroundColor) {
        this.canvas.backgroundColor = data.canvas.backgroundColor;
      }
    }

    // 清空画布并加载对象
    this.canvas.clear();

    if (data.objects && Array.isArray(data.objects)) {
      try {
        await this.canvas.loadFromJSON({ objects: data.objects });
        this.canvas.renderAll();
      } catch (error) {
        console.error('Error loading objects:', error);
      }
    }

    this.emit('json:loaded', { data: this.data });
  }

  // 获取当前JSON数据
  toJSON() {
    return JSON.parse(JSON.stringify(this.data));
  }

  // 添加文本
  addText(text, options = {}) {
    const textObj = new Textbox(text, {
      left: 100,
      top: 100,
      fontSize: 20,
      fill: '#000000',
      width: 200,
      ...options
    });

    this.canvas.add(textObj);
    this.canvas.setActiveObject(textObj);
    this.emit('text:added', { object: textObj });
    return textObj;
  }

  // 添加图片
  async addImage(url, options = {}) {
    try {
      const img = await FabricImage.fromURL(url, {
        crossOrigin: 'anonymous'
      });

      img.set({
        left: 100,
        top: 100,
        scaleX: 0.5,
        scaleY: 0.5,
        ...options
      });

      this.canvas.add(img);
      this.canvas.setActiveObject(img);
      this.emit('image:added', { object: img });
      return img;
    } catch (error) {
      console.error('Error loading image:', error);
      throw error;
    }
  }

  // 添加矩形
  addRect(options = {}) {
    const rect = new Rect({
      left: 100,
      top: 100,
      width: 100,
      height: 100,
      fill: '#ff0000',
      ...options
    });

    this.canvas.add(rect);
    this.canvas.setActiveObject(rect);
    this.emit('rect:added', { object: rect });
    return rect;
  }

  // 添加圆形
  addCircle(options = {}) {
    const circle = new Circle({
      left: 100,
      top: 100,
      radius: 50,
      fill: '#00ff00',
      ...options
    });

    this.canvas.add(circle);
    this.canvas.setActiveObject(circle);
    this.emit('circle:added', { object: circle });
    return circle;
  }

  // 添加三角形
  addTriangle(options = {}) {
    const triangle = new Triangle({
      left: 100,
      top: 100,
      width: 100,
      height: 100,
      fill: '#0000ff',
      ...options
    });

    this.canvas.add(triangle);
    this.canvas.setActiveObject(triangle);
    this.emit('triangle:added', { object: triangle });
    return triangle;
  }

  // 添加椭圆
  addEllipse(options = {}) {
    const ellipse = new Ellipse({
      left: 100,
      top: 100,
      rx: 80,
      ry: 40,
      fill: '#ff00ff',
      ...options
    });

    this.canvas.add(ellipse);
    this.canvas.setActiveObject(ellipse);
    this.emit('ellipse:added', { object: ellipse });
    return ellipse;
  }

  // 添加线条
  addLine(options = {}) {
    const line = new Line([50, 50, 200, 200], {
      stroke: '#000000',
      strokeWidth: 2,
      ...options
    });

    this.canvas.add(line);
    this.canvas.setActiveObject(line);
    this.emit('line:added', { object: line });
    return line;
  }

  // 添加多边形
  addPolygon(points = [], options = {}) {
    // 默认创建一个五边形
    const defaultPoints = points.length ? points : [
      { x: 0, y: 0 },
      { x: 50, y: -50 },
      { x: 100, y: 0 },
      { x: 75, y: 50 },
      { x: 25, y: 50 }
    ];

    const polygon = new Polygon(defaultPoints, {
      left: 100,
      top: 100,
      fill: '#ffa500',
      ...options
    });

    this.canvas.add(polygon);
    this.canvas.setActiveObject(polygon);
    this.emit('polygon:added', { object: polygon });
    return polygon;
  }

  // 添加自由绘图路径
  addPath(path, options = {}) {
    const pathObj = new Path(path, {
      fill: '',
      stroke: '#000000',
      strokeWidth: 2,
      ...options
    });

    this.canvas.add(pathObj);
    this.canvas.setActiveObject(pathObj);
    this.emit('path:added', { object: pathObj });
    return pathObj;
  }

  // 添加可编辑文本
  addEditableText(text, options = {}) {
    const textObj = new IText(text, {
      left: 100,
      top: 100,
      fontSize: 20,
      fill: '#000000',
      ...options
    });

    this.canvas.add(textObj);
    this.canvas.setActiveObject(textObj);
    this.emit('itext:added', { object: textObj });
    return textObj;
  }

  // 将选中对象组合
  groupSelected() {
    const activeSelection = this.canvas.getActiveObject();
    if (!activeSelection || !(activeSelection instanceof ActiveSelection)) {
      return null;
    }

    const group = activeSelection.toGroup();
    this.canvas.renderAll();
    this.emit('group:created', { object: group });
    return group;
  }

  // 解组选中的组
  ungroupSelected() {
    const activeObject = this.canvas.getActiveObject();
    if (!activeObject || !(activeObject instanceof Group)) {
      return null;
    }

    const items = activeObject.toActiveSelection();
    this.canvas.renderAll();
    this.emit('group:ungrouped', { objects: items });
    return items;
  }

  // 将对象移到前面
  bringObjectForward() {
    const activeObject = this.canvas.getActiveObject();
    console.log(activeObject)
    if (activeObject) {
      this.canvas.bringObjectForward(activeObject);
      this.canvas.renderAll();
      this.emit('object:moved', { object: activeObject, action: 'forward' });
    }
  }

  // 将对象移到最前
  bringObjectToFront() {
    const activeObject = this.canvas.getActiveObject();
    if (activeObject) {
      this.canvas.bringObjectToFront(activeObject);
      this.canvas.renderAll();
      this.emit('object:moved', { object: activeObject, action: 'front' });
    }
  }

  // 将对象移到后面
  sendBackward() {
    const activeObject = this.canvas.getActiveObject();
    if (activeObject) {
      this.canvas.sendBackward(activeObject);
      this.canvas.renderAll();
      this.emit('object:moved', { object: activeObject, action: 'backward' });
    }
  }

  // 将对象移到最后
  sendToBack() {
    const activeObject = this.canvas.getActiveObject();
    if (activeObject) {
      this.canvas.sendToBack(activeObject);
      this.canvas.renderAll();
      this.emit('object:moved', { object: activeObject, action: 'back' });
    }
  }

  // 应用滤镜到图片
  applyFilter(image, filter) {
    if (!(image instanceof FabricImage)) {
      throw new Error('Object is not an image');
    }

    image.filters = image.filters || [];
    image.filters.push(filter);
    image.applyFilters();
    this.canvas.renderAll();
    this.emit('filter:applied', { object: image, filter });
  }

  // 移除图片滤镜
  removeFilters(image) {
    if (!(image instanceof FabricImage)) {
      throw new Error('Object is not an image');
    }

    image.filters = [];
    image.applyFilters();
    this.canvas.renderAll();
    this.emit('filters:removed', { object: image });
  }

  // 克隆选中对象
  cloneSelected() {
    const activeObject = this.canvas.getActiveObject();
    if (!activeObject) return null;

    activeObject.clone((cloned) => {
      cloned.set({
        left: activeObject.left + 10,
        top: activeObject.top + 10
      });

      this.canvas.add(cloned);
      this.canvas.setActiveObject(cloned);
      this.emit('object:cloned', { original: activeObject, clone: cloned });
    });
  }

  // 锁定选中对象
  lockSelected() {
    const activeObject = this.canvas.getActiveObject();
    if (!activeObject) return;

    activeObject.set({
      lockMovementX: true,
      lockMovementY: true,
      lockRotation: true,
      lockScalingX: true,
      lockScalingY: true,
      hasControls: false,
      selectable: false
    });

    this.canvas.discardActiveObject();
    this.canvas.renderAll();
    this.emit('object:locked', { object: activeObject });
  }

  // 解锁对象
  unlockObject(object) {
    if (!object) return;

    object.set({
      lockMovementX: false,
      lockMovementY: false,
      lockRotation: false,
      lockScalingX: false,
      lockScalingY: false,
      hasControls: true,
      selectable: true
    });

    this.canvas.renderAll();
    this.emit('object:unlocked', { object });
  }

  // 应用线性渐变
  applyLinearGradient(object, colors, options = {}) {
    if (!object) return;

    const defaultOptions = {
      x1: 0,
      y1: 0,
      x2: object.width || 100,
      y2: 0,
      colorStops: colors
    };

    const gradient = new Gradient({
      type: 'linear',
      ...defaultOptions,
      ...options
    });

    object.set('fill', gradient);
    this.canvas.renderAll();
    this.emit('gradient:applied', { object, gradient });
  }

  // 应用径向渐变
  applyRadialGradient(object, colors, options = {}) {
    if (!object) return;

    const width = object.width || 100;
    const height = object.height || 100;

    const defaultOptions = {
      r1: 0,
      r2: width / 2,
      x1: width / 2,
      y1: height / 2,
      x2: width / 2,
      y2: height / 2,
      colorStops: colors
    };

    const gradient = new Gradient({
      type: 'radial',
      ...defaultOptions,
      ...options
    });

    object.set('fill', gradient);
    this.canvas.renderAll();
    this.emit('gradient:applied', { object, gradient });
  }

  // 应用图案填充
  async applyPattern(object, imageUrl, options = {}) {
    if (!object) return;

    try {
      const img = await new Promise((resolve, reject) => {
        const imgEl = new Image();
        imgEl.crossOrigin = 'anonymous';
        imgEl.onload = () => resolve(imgEl);
        imgEl.onerror = reject;
        imgEl.src = imageUrl;
      });

      const pattern = new Pattern({
        source: img,
        repeat: 'repeat',
        ...options
      });

      object.set('fill', pattern);
      this.canvas.renderAll();
      this.emit('pattern:applied', { object, pattern });
    } catch (error) {
      console.error('Error applying pattern:', error);
      throw error;
    }
  }

  // 添加阴影
  addShadow(object, options = {}) {
    if (!object) return;

    const shadow = new Shadow({
      color: 'rgba(0,0,0,0.3)',
      blur: 10,
      offsetX: 5,
      offsetY: 5,
      ...options
    });

    object.set('shadow', shadow);
    this.canvas.renderAll();
    this.emit('shadow:applied', { object, shadow });
  }

  // 启用绘图模式
  enableDrawingMode(options = {}) {
    this.canvas.isDrawingMode = true;
    const brushType = options.brushType || 'pencil';

    // 根据 brushType 创建对应的笔刷
    if (brushType === 'pencil') {
      this.canvas.freeDrawingBrush = new PencilBrush(this.canvas);
    } else if (brushType === 'circle') {
      this.canvas.freeDrawingBrush = new CircleBrush(this.canvas);
    } else if (brushType === 'spray') {
      this.canvas.freeDrawingBrush = new SprayBrush(this.canvas);
    } else {
      this.canvas.freeDrawingBrush = new PencilBrush(this.canvas);
    }

    // 设置笔刷属性
    this.canvas.freeDrawingBrush.color = options.color || '#000000';
    this.canvas.freeDrawingBrush.width = options.width || 5;

    this.emit('drawing:enabled', { options });
  }

  // 禁用绘图模式
  disableDrawingMode() {
    this.canvas.isDrawingMode = false;
    this.emit('drawing:disabled');
  }

  // 保存当前状态到历史记录
  saveToHistory() {
    // 如果不是在处理历史记录中，才添加历史记录
    if (!this.isHistoryProcessing) {
      // 删除当前索引之后的所有历史记录（如果用户在撤销后进行了新的操作）
      if (this.historyIndex < this.history.length - 1) {
        this.history = this.history.slice(0, this.historyIndex + 1);
      }

      // 添加新的历史记录
      const json = JSON.stringify(this.canvas.toJSON(['id', 'selectable']));
      this.history.push(json);

      // 如果历史记录超过最大长度，则删除最早的记录
      if (this.history.length > this.historyMaxLength) {
        this.history.shift();
      } else {
        this.historyIndex++;
      }
    }
  }

  // 撤销操作
  undo() {
    if (this.historyIndex > 0) {
      this.isHistoryProcessing = true;
      this.historyIndex--;
      const json = this.history[this.historyIndex];
      this.canvas.loadFromJSON(JSON.parse(json), () => {
        this.canvas.renderAll();
        this.isHistoryProcessing = false;
        this.emit('history:undo');
      });
    }
  }

  // 重做操作
  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.isHistoryProcessing = true;
      this.historyIndex++;
      const json = this.history[this.historyIndex];
      this.canvas.loadFromJSON(JSON.parse(json), () => {
        this.canvas.renderAll();
        this.isHistoryProcessing = false;
        this.emit('history:redo');
      });
    }
  }

  // 添加SVG路径
  async addSVG(svgUrl, options = {}) {
    try {
      const loadedObjects = await new Promise((resolve, reject) => {
        fabric.loadSVGFromURL(svgUrl, (objects, options) => {
          resolve({ objects, options });
        }, reject);
      });

      const { objects, options: svgOptions } = loadedObjects;

      const svgGroup = new Group(objects, {
        left: 100,
        top: 100,
        scaleX: 0.5,
        scaleY: 0.5,
        ...options
      });

      this.canvas.add(svgGroup);
      this.canvas.setActiveObject(svgGroup);
      this.emit('svg:added', { object: svgGroup });
      return svgGroup;
    } catch (error) {
      console.error('Error loading SVG:', error);
      throw error;
    }
  }

  // 删除选中对象
  deleteSelected() {
    const activeObjects = this.canvas.getActiveObjects();
    if (activeObjects.length) {
      this.canvas.discardActiveObject();
      activeObjects.forEach(obj => {
        this.canvas.remove(obj);
      });
      this.emit('objects:deleted', { objects: activeObjects });
    }
  }

  // 清空画布
  clear() {
    this.canvas.clear();
    this.emit('canvas:cleared');
  }

  // 设置画布尺寸
  setCanvasSize(width, height) {
    this.canvas.setDimensions({ width, height });
    this.data.canvas.width = width;
    this.data.canvas.height = height;
    this.emit('canvas:resized', { width, height });
  }

  // 设置背景色
  setBackgroundColor(color) {
    this.canvas.backgroundColor = color;
    this.canvas.renderAll();
    this.data.canvas.backgroundColor = color;
    this.emit('background:changed', { color });
  }

  // 导出为图片
  toDataURL(format = 'png', quality = 1) {
    return this.canvas.toDataURL({
      format: format,
      quality: quality
    });
  }

  // 获取选中对象
  getActiveObject() {
    return this.canvas.getActiveObject();
  }

  // 获取所有对象
  getObjects() {
    return this.canvas.getObjects();
  }

  // 销毁编辑器
  destroy() {
    if (this.canvas) {
      this.canvas.dispose();
      this.canvas = null;
    }

    if (this.container) {
      this.container.innerHTML = '';
    }

    this.removeAllListeners();
    this.emit('destroyed');
  }
}

export default PosterEditor;
