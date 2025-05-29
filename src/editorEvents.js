// src/editorEvents.js
// 编辑器事件注册与处理，便于维护和扩展

/**
 * 注册所有需要的事件监听
 * 例如 window.editorEvents.registerAll(window.editor)
 */
const editorEvents = {
  registerAll(editorInstance, options = {}) {
    // 事件回调可自定义传入，也可在此处统一处理
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
    editorInstance.on('object:added', (e) => {
      if (options.onObjectAdded) options.onObjectAdded(e);
      console.log('添加了对象', e.target?.type);
    });
    editorInstance.on('object:modified', (e) => {
      if (options.onObjectModified) options.onObjectModified(e);
      console.log('对象已修改');
    });
    editorInstance.on('selection:created', (e) => {
      if (options.onSelectionCreated) options.onSelectionCreated(e);
      console.log('选中对象', e.selected?.length);
    });
    editorInstance.on('selection:cleared', (e) => {
      if (options.onSelectionCleared) options.onSelectionCleared(e);
      console.log('取消选择');
    });
    // 可继续添加其他事件...
  }
};

export default editorEvents;

