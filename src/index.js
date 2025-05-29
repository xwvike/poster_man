// src/index.js
import PosterEditor from './PosterEditor.js';
import EventEmitter from './EventEmitter.js';

// 为了支持iframe通信，添加postMessage支持
class IframePosterEditor extends PosterEditor {
  constructor(container, options = {}) {
    super(container, options);

    this.enableIframeMode = options.enableIframeMode || false;

    if (this.enableIframeMode) {
      this.setupIframeCommunication();
    }
  }

  setupIframeCommunication() {
    // 监听来自父窗口的消息
    window.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'POSTER_EDITOR_COMMAND') {
        this.handleIframeCommand(event.data);
      }
    });

    // 重写emit方法，向父窗口发送事件
    const originalEmit = this.emit.bind(this);
    this.emit = (event, data) => {
      originalEmit(event, data);

      if (this.enableIframeMode && window.parent !== window) {
        window.parent.postMessage({
          type: 'POSTER_EDITOR_EVENT',
          event: event,
          data: data
        }, '*');
      }
    };
  }

  handleIframeCommand(message) {
    const { command, data } = message;

    try {
      switch (command) {
        case 'loadJSON':
          this.loadFromJSON(data);
          break;
        case 'addText':
          this.addText(data.text, data.options);
          break;
        case 'addImage':
          this.addImage(data.url, data.options);
          break;
        case 'addRect':
          this.addRect(data.options);
          break;
        case 'addCircle':
          this.addCircle(data.options);
          break;
        case 'deleteSelected':
          this.deleteSelected();
          break;
        case 'clear':
          this.clear();
          break;
        case 'setCanvasSize':
          this.setCanvasSize(data.width, data.height);
          break;
        case 'setBackgroundColor':
          this.setBackgroundColor(data.color);
          break;
        case 'getJSON':
          this.sendResponse('getJSON', this.toJSON());
          break;
        case 'getDataURL':
          this.sendResponse('getDataURL', this.toDataURL(data.format, data.quality));
          break;
        default:
          console.warn('Unknown iframe command:', command);
      }
    } catch (error) {
      this.sendError(command, error.message);
    }
  }

  sendResponse(command, data) {
    if (window.parent !== window) {
      window.parent.postMessage({
        type: 'POSTER_EDITOR_RESPONSE',
        command: command,
        data: data
      }, '*');
    }
  }

  sendError(command, error) {
    if (window.parent !== window) {
      window.parent.postMessage({
        type: 'POSTER_EDITOR_ERROR',
        command: command,
        error: error
      }, '*');
    }
  }
}

// 自动初始化（如果在iframe中使用）
if (typeof window !== 'undefined') {
  window.PosterEditor = IframePosterEditor;
  window.EventEmitter = EventEmitter;

  // 检查是否需要自动初始化
  document.addEventListener('DOMContentLoaded', () => {
    const autoInit = document.querySelector('[data-poster-editor-auto]');
    if (autoInit) {
      const options = JSON.parse(autoInit.getAttribute('data-options') || '{}');
      new IframePosterEditor(autoInit, { ...options, enableIframeMode: true });
    }
  });
}

export { IframePosterEditor as PosterEditor, EventEmitter };
export default IframePosterEditor;
