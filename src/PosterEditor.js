// src/PosterEditor.js
import { Canvas, FabricImage, Textbox, Rect, Circle, util } from 'fabric';
import EventEmitter from './EventEmitter.js';

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
      version: '1.0.0',
      canvas: {
        width: this.options.width,
        height: this.options.height,
        backgroundColor: this.options.backgroundColor
      },
      objects: []
    };

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
        // v6 使用 loadFromJSON 方法
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

  // 添加文本 (v6使用Textbox替代Text以获得更好的编辑体验)
  addText(text, options = {}) {
    const textObj = new Textbox(text, {
      left: 100,
      top: 100,
      fontSize: 20,
      fill: '#000000',
      width: 200, // Textbox需要指定宽度
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
      // v6 使用 FabricImage.fromURL，返回Promise
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
