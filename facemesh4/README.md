# 参数化捏脸
## 捏脸部分
* 概述
   * 主要代码在character-customization文件夹下
   * 模型, 数据, 以及代码参考了face-nn
   * female-face文件夹, 女性人脸模型
   * config.js, 一些枚举类型
   * face-customization.js, 主逻辑
   * female.js, 女性的捏脸数据
* female-face
   * 从face-nn工程中导出, 使用Unity自带的Fbx Exporter包
   * 导入到PlayCanvas中, 加入材质, 贴图, 再导出
* female.js
   * bones
      * type: 控制方式, PositionX~Z, ScaleX~Z, Rotation
      * name: 骨骼名
      * minValue/maxValue: 最小最大值, 适用于Position和Scale
      * minRot/maxRot: 最小最大旋转, 适用于Rotation
      * 当参数的值为0时, 对应最小值
      * 当参数的值为1时, 对应最大值
   * groups
      * 控制组, 表示某个参数控制一组骨骼, 常见的如眼睛, 耳朵, 总是左右一起控制
   * face
      * faceType: 分成HEAD和SENSE, 意义不明
      * name: 显示名称, 如额头, 两颊
      * icon: 图标, 指明捏脸部位, 这里没有使用
      * type: 如果是None, 使用values/properties, 反之使用x/y。 非None的值只用于显示调节方式, 如宽窄, 位置等等
      * x, y: 控制组号， x一般表示横向的调节， y表示纵向的调节
      * properties: 控制组号, 和values一一对应
      * values: 控制类型, 和config.valueTypes/valueNames对应, 纯描述, 不影响实际的控制
      * 可参考face-customization.js内的注释
* face-customization.js
   * 初始化
      * 在PlayCanvas中加载模型完毕
      * 调用faceCustomization.bindBones(rootNode);
      * 根据bones, 查找骨骼并记录, 并且保存初始值为defaultValue
      * 由于引擎差异, 在Unity中计算得到的参数需要修正
      * 所有的位置需要扩大100倍
      * X需要取反, 四元数的Y,Z需要取反
   * 创建UI
      * showUI, 使用dat.gui创建UI
      * 最终调用adjustBone
   * 调节骨骼
      * adjustBone(groupId, value)
      * value是一个0~1的值
      * 首先将value映射到-1~1
      * 如果大于0, 那么对默认值和最大值进行插值
      * 如果小于0, 那么对默认值和最小值进行插值, 此时权重取绝对值
