// src/editorEvents.js
// 编辑器事件注册与处理，便于维护和扩展

/**
 * 注册所有需要的事件监听
 * 例如 window.editorEvents.registerAll(window.editor)
 */
const editorEvents = {
  registerAll(editorInstance, options = {}) {
    // 基础事件
    editorInstance.on('initialized', (e) => {
      if (options.onInitialized) options.onInitialized(e);
      // 默认行为
      console.log('编辑器初始化完成');
    });

    editorInstance.on('data:changed', (e) => {
      if (options.onDataChanged) options.onDataChanged(e);
      // 默认行为
      console.log('数据变更', e.data);
    });

    editorInstance.on('json:loaded', (e) => {
      if (options.onJsonLoaded) options.onJsonLoaded(e);
      console.log('JSON数据加载完成');
    });

    editorInstance.on('destroyed', () => {
      if (options.onDestroyed) options.onDestroyed();
      console.log('编辑器已销毁');
    });

    // 对象事件
    editorInstance.on('object:added', (e) => {
      if (options.onObjectAdded) options.onObjectAdded(e);
      console.log('添加了对象', e.target?.type);
    });

    editorInstance.on('object:modified', (e) => {
      if (options.onObjectModified) options.onObjectModified(e);
      console.log('对象已修改');
    });

    editorInstance.on('object:removed', (e) => {
      if (options.onObjectRemoved) options.onObjectRemoved(e);
      console.log('对象已移除');
    });

    editorInstance.on('objects:deleted', (e) => {
      if (options.onObjectsDeleted) options.onObjectsDeleted(e);
      console.log('对象已删除', e.objects?.length);
    });

    editorInstance.on('object:moved', (e) => {
      if (options.onObjectMoved) options.onObjectMoved(e);
      console.log(`对象已移动: ${e.action}`);
    });

    editorInstance.on('object:cloned', (e) => {
      if (options.onObjectCloned) options.onObjectCloned(e);
      console.log('对象已克隆');
    });

    editorInstance.on('object:locked', (e) => {
      if (options.onObjectLocked) options.onObjectLocked(e);
      console.log('对象已锁定');
    });

    editorInstance.on('object:unlocked', (e) => {
      if (options.onObjectUnlocked) options.onObjectUnlocked(e);
      console.log('对象已解锁');
    });

    // 选择事件
    editorInstance.on('selection:created', (e) => {
      if (options.onSelectionCreated) options.onSelectionCreated(e);
      console.log('选中对象', e.selected?.length);
    });

    editorInstance.on('selection:updated', (e) => {
      if (options.onSelectionUpdated) options.onSelectionUpdated(e);
      console.log('选择已更新');
    });

    editorInstance.on('selection:cleared', (e) => {
      if (options.onSelectionCleared) options.onSelectionCleared(e);
      console.log('取消选择');
    });

    // 画布事件
    editorInstance.on('canvas:cleared', () => {
      if (options.onCanvasCleared) options.onCanvasCleared();
      console.log('画布已清空');
    });

    editorInstance.on('canvas:resized', (e) => {
      if (options.onCanvasResized) options.onCanvasResized(e);
      console.log(`画布已调整大小: ${e.width}x${e.height}`);
    });

    editorInstance.on('background:changed', (e) => {
      if (options.onBackgroundChanged) options.onBackgroundChanged(e);
      console.log(`背景色已更改为: ${e.color}`);
    });

    // 具体对象添加事件
    editorInstance.on('text:added', (e) => {
      if (options.onTextAdded) options.onTextAdded(e);
      console.log('文本已添加');
    });

    editorInstance.on('itext:added', (e) => {
      if (options.onITextAdded) options.onITextAdded(e);
      console.log('可编辑文本已添加');
    });

    editorInstance.on('image:added', (e) => {
      if (options.onImageAdded) options.onImageAdded(e);
      console.log('图片已添加');
    });

    editorInstance.on('rect:added', (e) => {
      if (options.onRectAdded) options.onRectAdded(e);
      console.log('矩形已添加');
    });

    editorInstance.on('circle:added', (e) => {
      if (options.onCircleAdded) options.onCircleAdded(e);
      console.log('圆形已添加');
    });

    editorInstance.on('triangle:added', (e) => {
      if (options.onTriangleAdded) options.onTriangleAdded(e);
      console.log('三角形已添加');
    });

    editorInstance.on('ellipse:added', (e) => {
      if (options.onEllipseAdded) options.onEllipseAdded(e);
      console.log('椭圆已添加');
    });

    editorInstance.on('line:added', (e) => {
      if (options.onLineAdded) options.onLineAdded(e);
      console.log('线条已添加');
    });

    editorInstance.on('polygon:added', (e) => {
      if (options.onPolygonAdded) options.onPolygonAdded(e);
      console.log('多边形已添加');
    });

    editorInstance.on('path:added', (e) => {
      if (options.onPathAdded) options.onPathAdded(e);
      console.log('路径已添加');
    });

    editorInstance.on('svg:added', (e) => {
      if (options.onSvgAdded) options.onSvgAdded(e);
      console.log('SVG已添加');
    });

    // 组合操作事件
    editorInstance.on('group:created', (e) => {
      if (options.onGroupCreated) options.onGroupCreated(e);
      console.log('组已创建');
    });

    editorInstance.on('group:ungrouped', (e) => {
      if (options.onGroupUngrouped) options.onGroupUngrouped(e);
      console.log('组已解组');
    });

    // 效果与样式事件
    editorInstance.on('filter:applied', (e) => {
      if (options.onFilterApplied) options.onFilterApplied(e);
      console.log('滤镜已应用');
    });

    editorInstance.on('filters:removed', (e) => {
      if (options.onFiltersRemoved) options.onFiltersRemoved(e);
      console.log('滤镜已移除');
    });

    editorInstance.on('gradient:applied', (e) => {
      if (options.onGradientApplied) options.onGradientApplied(e);
      console.log('渐变已应用');
    });

    editorInstance.on('pattern:applied', (e) => {
      if (options.onPatternApplied) options.onPatternApplied(e);
      console.log('图案已应用');
    });

    editorInstance.on('shadow:applied', (e) => {
      if (options.onShadowApplied) options.onShadowApplied(e);
      console.log('阴影已应用');
    });

    // 绘图模式事件
    editorInstance.on('drawing:enabled', (e) => {
      if (options.onDrawingEnabled) options.onDrawingEnabled(e);
      console.log('绘图模式已启用');
    });

    editorInstance.on('drawing:disabled', () => {
      if (options.onDrawingDisabled) options.onDrawingDisabled();
      console.log('绘图模式已禁用');
    });

    // 历史记录事件
    editorInstance.on('history:undo', () => {
      if (options.onHistoryUndo) options.onHistoryUndo();
      console.log('已撤销操作');
    });

    editorInstance.on('history:redo', () => {
      if (options.onHistoryRedo) options.onHistoryRedo();
      console.log('已重做操作');
    });
  },

  // 注册单个事件的辅助方法
  register(editorInstance, eventName, callback) {
    editorInstance.on(eventName, callback);
    return () => editorInstance.off(eventName, callback); // 返回注销函数
  },

  // 批量注册指定事件
  registerEvents(editorInstance, events = {}) {
    const unsubscribers = [];

    Object.entries(events).forEach(([eventName, callback]) => {
      if (typeof callback === 'function') {
        unsubscribers.push(this.register(editorInstance, eventName, callback));
      }
    });

    // 返回一个函数，调用它可以注销所有注册的事件
    return () => unsubscribers.forEach(unsubscribe => unsubscribe());
  }
};

export default editorEvents;
