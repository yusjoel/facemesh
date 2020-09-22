import {femaleFaceData} from './female.js'
import {config} from './config.js'

/**
 * @class
 * @name Parameter
 * @description 用于捏脸的参数
 * @property {string} faceType
 * @property {string} name 中文名
 * @property {string} icon 图标名, 无后缀
 * @property {string} type 如果是None, 使用values/properties, 反之使用x/y
 * @property {number} x 控制组号, 一般表示横向的位移/缩放
 * @property {number} y 控制组号, 一般表示纵向的位移/缩放
 * @property {number[]} properties 控制组号, 和values一一对应
 * @property {number[]} values 控制类型, 和config.valueTypes/valueNames对应, 纯描述, 不影响实际的控制
 */

/**
 * @class
 * @name BoneControlInfo
 * @description 骨骼控制信息
 * @property {string} type 控制类型, 包括PositionX-Z, Rotation, ScaleX-Z
 * @property {string} name 骨骼名
 * @property {number} minValue "最小值", 参数为-1时使用该值
 * @property {number} maxValue "最大值", 参数为1时使用该值
 * @property {number[]} minRot 旋转的"最小值", 四元数
 * @property {number[]} maxRot 旋转的"最大值", 四元数
 */

/**
 * 骨骼控制
 * @property {pc.GraphNode} boneNode 骨骼节点
 * @property {string} type 控制类型, 包括PositionX-Z, Rotation, ScaleX-Z
 * @property {number|pc.Quat} defaultValue 默认值
 * @property {number|pc.Quat} minValue "最小值"
 * @property {number|pc.Quat} maxValue "最大值"
 * @constructor
 */
function BoneControl(boneNode, type, defaultValue, minValue, maxValue) {
    this.boneNode = boneNode;
    this.type = type;
    this.defaultValue = defaultValue;
    this.minValue = minValue;
    this.maxValue = maxValue;
}

/**
 * 捏脸
 * @constructor
 */
export function FaceCustomization() {
    /**
     *
     * @type {BoneControl[]}
     */
    this.boneControls = [];

    /**
     * @type {Parameter[]}
     */
    this.parameters = femaleFaceData.face;

    /**
     * @type {BoneControlInfo[]}
     */
    this.boneControlInfos = femaleFaceData.bones;

    this.boneControlGroups = femaleFaceData.groups;
}

/**
 * 调整骨骼
 * @param groupId 控制组序号
 * @param value 参数值 0~1
 */
FaceCustomization.prototype.adjustBone = function (groupId, value) {
    let boneControlIndices = this.boneControlGroups[groupId];
    for (let i = 0; i < boneControlIndices.length; i++) {
        let boneControlIndex = boneControlIndices[i];
        let boneControl = this.boneControls[boneControlIndex];
        let t = Math.abs((value - 0.5) * 2);
        let min = boneControl.defaultValue;
        let max = value > 0.5 ? boneControl.maxValue : boneControl.minValue;

        // 关于插值
        // 首先要读取骨骼的初始值作为默认值(defaultValue)
        // 所有的参数范围都是0~1, 先转成-1~1
        // 如果大于0, 那么对默认值和最大值进行插值
        // 如果小于0, 那么对默认值和最小值进行插值, 此时权重取绝对值

        if (boneControl.type === 'Rotation') {
            let finalValue = new pc.Quat();
            finalValue.slerp(min, max, t);
            boneControl.boneNode.setLocalRotation(finalValue);
        } else {
            let finalValue = pc.math.lerp(min, max, t);

            let position = boneControl.boneNode.getLocalPosition();
            let scale = boneControl.boneNode.getLocalScale();
            if (boneControl.type === 'PositionX') {
                position.x = finalValue;
            } else if (boneControl.type === 'PositionY') {
                position.y = finalValue;
            } else if (boneControl.type === 'PositionZ') {
                position.z = finalValue;
            } else if (boneControl.type === 'ScaleX') {
                scale.x = finalValue;
            } else if (boneControl.type === 'ScaleY') {
                scale.y = finalValue;
            } else if (boneControl.type === 'ScaleZ') {
                scale.z = finalValue;
            }

            boneControl.boneNode.setLocalPosition(position);
            boneControl.boneNode.setLocalScale(scale);
        }
    }
};

/**
 * 显示捏脸控制参数UI
 */
FaceCustomization.prototype.showUI = function () {
    let self = this;

    let gui = new dat.GUI();

    let parameterCount = this.parameters.length;
    for (let i = 0; i < parameterCount; i++) {
        let parameter = this.parameters[i];
        let folder = gui.addFolder(parameter.name);
        if (parameter.type === "None") {
            let group = {};
            for (let j = 0; j < parameter.properties.length; j++) {
                let valueType = parameter.values[j];
                // 英文名
                let _valueType = config.valueTypes[valueType];
                // 中文名
                let valueName = config.valueNames[valueType];
                group[_valueType] = 0.5;
                folder.add(group, _valueType, 0, 1).name(valueName).onChange(value => {
                    self.adjustBone(parameter.properties[j], value);
                });
            }
        } else {
            let group = {x: 0.5, y: 0.5};
            folder.add(group, "x", 0, 1).onChange(x => {
                self.adjustBone(parameter.x, x);
            });
            folder.add(group, "y", 0, 1).onChange(y => {
                self.adjustBone(parameter.y, y);
            });
        }
    }
};

/**
 * 读取骨骼控制信息, 绑定骨骼节点
 * @param rootNode {pc.GraphNode} 骨骼根节点
 */
FaceCustomization.prototype.bindBones = function (rootNode) {
    for (let i = 0; i < this.boneControlInfos.length; i++) {
        let boneControlInfo = this.boneControlInfos[i];
        let boneName = boneControlInfo.name;
        let boneNode = rootNode.findByName(boneName);

        if (!boneNode) {
            console.error(`${boneName} not found`);
            continue;
        }

        // 由于最大最小值都是在Unity中获取, 导入到PlayCanvas中需要一些变换
        // 所有的位置需要扩大100倍
        // X需要取反, 四元数的Y,Z需要取反

        let defaultValue = 0;
        let minValue = boneControlInfo.minValue;
        let maxValue = boneControlInfo.maxValue;
        let boneControlType = boneControlInfo.type;
        if (boneControlType === 'PositionX') {
            defaultValue = boneNode.getLocalPosition().x;
            minValue = minValue * -100;
            maxValue = maxValue * -100;
        } else if (boneControlType === 'PositionY') {
            defaultValue = boneNode.getLocalPosition().y;
            minValue = minValue * 100;
            maxValue = maxValue * 100;
        } else if (boneControlType === 'PositionZ') {
            defaultValue = boneNode.getLocalPosition().z;
            minValue = minValue * 100;
            maxValue = maxValue * 100;
        } else if (boneControlType === 'ScaleX')
            defaultValue = boneNode.getLocalScale().x;
        else if (boneControlType === 'ScaleY')
            defaultValue = boneNode.getLocalScale().y;
        else if (boneControlType === 'ScaleZ')
            defaultValue = boneNode.getLocalScale().z;
        else if (boneControlType === 'Rotation') {
            defaultValue = boneNode.getLocalRotation().clone();
            boneControlInfo.minRot[1] = -boneControlInfo.minRot[1];
            boneControlInfo.minRot[2] = -boneControlInfo.minRot[2];
            boneControlInfo.maxRot[1] = -boneControlInfo.maxRot[1];
            boneControlInfo.maxRot[2] = -boneControlInfo.maxRot[2];
            minValue = new pc.Quat(boneControlInfo.minRot);
            maxValue = new pc.Quat(boneControlInfo.maxRot);
        }

        let boneControl = new BoneControl(boneNode, boneControlType, defaultValue, minValue, maxValue);

        this.boneControls.push(boneControl);
    }

};