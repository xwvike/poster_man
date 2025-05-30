// src/editorActions.js
// 编辑器操作API封装，便于外部调用和维护

/**
 * 所有操作都通过这些API进行调用
 * 例如 window.editorActions.addText('内容', { fontSize: 24 })
 */
const editorActions = (editorInstance) => {
  // 创建一个代理对象，用于自动转发方法调用到editorInstance
  const handler = {
    get(target, prop, receiver) {
      // 如果属性是函数，则尝试从editorInstance获取
      if (typeof prop === 'string' && typeof editorInstance[prop] === 'function') {
        return (...args) => {
          return editorInstance[prop](...args);
        };
      }

      // 否则使用默认行为
      return Reflect.get(target, prop, receiver);
    }
  };

  const baseActions = {
    // 基础图形操作
    addText(text, options = {}) {
      return editorInstance.addText(text, options);
    },
    addEditableText(text, options = {}) {
      return editorInstance.addEditableText(text, options);
    },
    addRect(options = {}) {
      return editorInstance.addRect(options);
    },
    addCircle(options = {}) {
      return editorInstance.addCircle(options);
    },
    addTriangle(options = {}) {
      return editorInstance.addTriangle(options);
    },
    addEllipse(options = {}) {
      return editorInstance.addEllipse(options);
    },
    addLine(options = {}) {
      return editorInstance.addLine(options);
    },
    addPolygon(points = [], options = {}) {
      return editorInstance.addPolygon(points, options);
    },
    addPath(path, options = {}) {
      return editorInstance.addPath(path, options);
    },
    addImage(url, options = {}) {
      return editorInstance.addImage(url, options);
    },
    addSVG(svgUrl, options = {}) {
      return editorInstance.addSVG(svgUrl, options);
    },

    // 对象操作
    deleteSelected() {
      return editorInstance.deleteSelected();
    },
    groupSelected() {
      return editorInstance.groupSelected();
    },
    ungroupSelected() {
      return editorInstance.ungroupSelected();
    },
    cloneSelected() {
      return editorInstance.cloneSelected();
    },
    lockSelected() {
      return editorInstance.lockSelected();
    },
    unlockObject(object) {
      return editorInstance.unlockObject(object);
    },

    // 图层操作
    bringObjectForward() {
      return editorInstance.bringObjectForward();
    },
    bringObjectToFront() {
      return editorInstance.bringObjectToFront();
    },
    sendBackward() {
      return editorInstance.sendBackward();
    },
    sendToBack() {
      return editorInstance.sendToBack();
    },

    // 效果与样式
    applyFilter(image, filter) {
      return editorInstance.applyFilter(image, filter);
    },
    removeFilters(image) {
      return editorInstance.removeFilters(image);
    },
    applyLinearGradient(object, colors, options = {}) {
      return editorInstance.applyLinearGradient(object, colors, options);
    },
    applyRadialGradient(object, colors, options = {}) {
      return editorInstance.applyRadialGradient(object, colors, options);
    },
    applyPattern(object, imageUrl, options = {}) {
      return editorInstance.applyPattern(object, imageUrl, options);
    },
    addShadow(object, options = {}) {
      return editorInstance.addShadow(object, options);
    },

    // 绘图模式
    enableDrawingMode(options = {}) {
      return editorInstance.enableDrawingMode(options);
    },
    disableDrawingMode() {
      return editorInstance.disableDrawingMode();
    },

    // 历史操作
    undo() {
      return editorInstance.undo();
    },
    redo() {
      return editorInstance.redo();
    },

    // 画布操作
    clear() {
      return editorInstance.clear();
    },
    setCanvasSize(width, height) {
      return editorInstance.setCanvasSize(width, height);
    },
    setBackgroundColor(color) {
      return editorInstance.setBackgroundColor(color);
    },

    // 导入导出
    toDataURL(format = 'png', quality = 1) {
      return editorInstance.toDataURL(format, quality);
    },
    toJSON() {
      return editorInstance.toJSON();
    },
    loadFromJSON(data) {
      return editorInstance.loadFromJSON(data);
    },

    // 查询方法
    getActiveObject() {
      return editorInstance.getActiveObject();
    },
    getObjects() {
      return editorInstance.getObjects();
    },

    // 其他
    destroy() {
      return editorInstance.destroy();
    },

    // 获取编辑器实例的引用
    getEditorInstance() {
      return editorInstance;
    }
  };

  // 使用Proxy来创建动态代理，自动转发方法调用
  return new Proxy(baseActions, handler);
};

export default editorActions;
