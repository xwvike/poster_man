import { FabricObject, Textbox, Control, controlsUtils, Point } from 'fabric';

/**
 * 自定义Fabric控制手柄样式
 * 为不同类型的控制点设计不同样式
 */
export const initCustomControls = () => {
  // 全局应用自定义控制点到所有FabricObject
  Object.assign(FabricObject.ownDefaults, {
    cornerSize: 10,
    cornerStrokeColor: '#FFFFFF',
    cornerStyle: 'circle',
    transparentCorners: false,
    borderColor: 'rgba(41, 98, 255, 0.7)',
    borderScaleFactor: 1,
    borderOpacityWhenMoving: 0.7
  });

  // 为文本对象特殊优化控制点
  Object.assign(Textbox.ownDefaults, {
    cornerSize: 9, // 文本框控制点稍小一些
    centeredRotation: true, // 确保文本也使用中心旋转
  });

  console.log('自定义控制点样式已全局应用');
};

export default initCustomControls;
