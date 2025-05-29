// src/editorActions.js
// 编辑器操作API封装，便于外部调用和维护

/**
 * 所有操作都通过这些API进行调用
 * 例如 window.editorActions.addText('内容', { fontSize: 24 })
 */
const editorActions = (editorInstance) => ({
  addText(text, options = {}) {
    return editorInstance.addText(text, options);
  },
  addRect(options = {}) {
    return editorInstance.addRect(options);
  },
  addCircle(options = {}) {
    return editorInstance.addCircle(options);
  },
  addImage(url, options = {}) {
    return editorInstance.addImage(url, options);
  },
  deleteSelected() {
    return editorInstance.deleteSelected();
  },
  clear() {
    return editorInstance.clear();
  },
  setCanvasSize(width, height) {
    return editorInstance.setCanvasSize(width, height);
  },
  setBackgroundColor(color) {
    return editorInstance.setBackgroundColor(color);
  },
  toDataURL(format = 'png', quality = 1) {
    return editorInstance.toDataURL(format, quality);
  },
  toJSON() {
    return editorInstance.toJSON();
  },
  loadFromJSON(data) {
    return editorInstance.loadFromJSON(data);
  },
  getActiveObject() {
    return editorInstance.getActiveObject();
  },
  getObjects() {
    return editorInstance.getObjects();
  },
  destroy() {
    return editorInstance.destroy();
  }
});

export default editorActions;

