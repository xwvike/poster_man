// src/index.js
import PosterEditor from './PosterEditor.js';
import EventEmitter from './EventEmitter.js';
import editorActions from './editorActions.js';
import editorEvents from './editorEvents.js';

// 为了支持iframe通信，添加postMessage支持
class IframePosterEditor extends PosterEditor {
  constructor(container, options = {}) {
    super(container, options);

    this.enableIframeMode = options.enableIframeMode || false;

    // 创建actions实例，方便访问
    this.actions = editorActions(this);

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
    const { command, data, callId } = message;

    try {
      // 动态查找并调用方法
      if (typeof this[command] === 'function') {
        const result = this[command](...(Array.isArray(data) ? data : [data]));

        // 对于返回Promise的方法，等待它完成
        if (result instanceof Promise) {
          result
            .then(value => this.sendResponse(command, value, callId))
            .catch(error => this.sendError(command, error.message, callId));
        } else {
          // 直接返回结果
          this.sendResponse(command, result, callId);
        }
      } else {
        throw new Error(`Command not found: ${command}`);
      }
    } catch (error) {
      this.sendError(command, error.message, callId);
    }
  }

  sendResponse(command, data, callId) {
    if (window.parent !== window) {
      window.parent.postMessage({
        type: 'POSTER_EDITOR_RESPONSE',
        command: command,
        data: data,
        callId: callId
      }, '*');
    }
  }

  sendError(command, error, callId) {
    if (window.parent !== window) {
      window.parent.postMessage({
        type: 'POSTER_EDITOR_ERROR',
        command: command,
        error: error,
        callId: callId
      }, '*');
    }
  }
}

// 创建与父窗口通信的工具
const createIframeController = (iframeElement) => {
  const callbackMap = new Map();
  let callIdCounter = 0;

  // 监听iframe的消息
  window.addEventListener('message', (event) => {
    if (event.source !== iframeElement.contentWindow) return;

    const { type, command, data, error, callId } = event.data;

    if (callId && callbackMap.has(callId)) {
      const { resolve, reject } = callbackMap.get(callId);
      callbackMap.delete(callId);

      if (type === 'POSTER_EDITOR_ERROR') {
        reject(new Error(error));
      } else {
        resolve(data);
      }
    } else if (type === 'POSTER_EDITOR_EVENT') {
      // 处理从iframe发来的事件
      const customEvent = new CustomEvent(`poster-editor:${event.data.event}`, {
        detail: event.data.data
      });
      iframeElement.dispatchEvent(customEvent);
    }
  });

  // 创建一个Proxy对象，自动将方法调用转换为postMessage命令
  const handler = {
    get(target, prop) {
      // 如果是事件监听相关方法
      if (prop === 'on' || prop === 'addEventListener') {
        return (eventName, callback) => {
          iframeElement.addEventListener(`poster-editor:${eventName}`, (e) => callback(e.detail));
        };
      }

      // 如果是事件注销方法
      if (prop === 'off' || prop === 'removeEventListener') {
        return (eventName, callback) => {
          iframeElement.removeEventListener(`poster-editor:${eventName}`, callback);
        };
      }

      // 对于其他方法，创建一个函数通过postMessage发送命令
      return (...args) => {
        const callId = callIdCounter++;

        return new Promise((resolve, reject) => {
          callbackMap.set(callId, { resolve, reject });

          iframeElement.contentWindow.postMessage({
            type: 'POSTER_EDITOR_COMMAND',
            command: prop,
            data: args.length === 1 ? args[0] : args,
            callId
          }, '*');

          // 设置超时处理
          setTimeout(() => {
            if (callbackMap.has(callId)) {
              callbackMap.delete(callId);
              reject(new Error(`Command ${prop} timed out`));
            }
          }, 5000);
        });
      };
    }
  };

  return new Proxy({}, handler);
};

// 自动初始化（如果在iframe中使用）
if (typeof window !== 'undefined') {
  window.PosterEditor = IframePosterEditor;
  window.EventEmitter = EventEmitter;
  window.editorActions = editorActions;
  window.editorEvents = editorEvents;
  window.createIframeController = createIframeController;

  // 检查是否需要自动初始化
  document.addEventListener('DOMContentLoaded', () => {
    const autoInit = document.querySelector('[data-poster-editor-auto]');
    if (autoInit) {
      const options = JSON.parse(autoInit.getAttribute('data-options') || '{}');
      const editor = new IframePosterEditor(autoInit, { ...options, enableIframeMode: true });

      // 暴露到全局，方便调试和访问
      window.editor = editor;
      window.actions = editor.actions;
    }
  });
}

export {
  IframePosterEditor as PosterEditor,
  EventEmitter,
  editorActions,
  editorEvents,
  createIframeController
};
export default IframePosterEditor;
