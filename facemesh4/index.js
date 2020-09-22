import {femaleFaceData} from './character-customization/female.js'

let valueTypes = [
    "BigSmall",
    "UpDown",
    "LeftRight",
    "ForwBack",
    "Scale",
    "Rotate",
    "Color",
    "Hue",
    "Length",
    "Shape",
    "Height",
    "Saturation",
    "Shading",
    "Reflect",
    "None",
];

let valueNames = [
    "大小",
    "上下",
    "左右",
    "前后",
    "缩放",
    "旋转",
    "Color",
    "Hue",
    "Length",
    "Shape",
    "Height",
    "Saturation",
    "Shading",
    "Reflect",
    "None",
];

let boneTransforms = [];

function lerp(a, b, t) {
    return a * (1 - t) + b * t;
}

function adjustBone(groupId, value) {
    let bones = femaleFaceData.groups[groupId];
    for (let i = 0; i < bones.length; i++) {
        let boneIndex = bones[i];
        let boneTransform = boneTransforms[boneIndex];
        let t = Math.abs((value - 0.5) * 2);
        let min = boneTransform.defaultValue;
        let max = value > 0.5 ? boneTransform.maxValue : boneTransform.minValue;

        if (boneTransform.bone.type === 'Rotation') {
            let finalValue = new pc.Quat();
            finalValue.slerp(min, max, t);
            boneTransform.boneNode.setLocalRotation(finalValue);
        } else {
            let finalValue = lerp(min, max, t);

            let position = boneTransform.boneNode.getLocalPosition();
            let scale = boneTransform.boneNode.getLocalScale();
            if (boneTransform.bone.type === 'PositionX') {
                position.x = finalValue;
            } else if (boneTransform.bone.type === 'PositionY') {
                position.y = finalValue;
            } else if (boneTransform.bone.type === 'PositionZ') {
                position.z = finalValue;
            } else if (boneTransform.bone.type === 'ScaleX') {
                scale.x = finalValue;
            } else if (boneTransform.bone.type === 'ScaleY') {
                scale.y = finalValue;
            } else if (boneTransform.bone.type === 'ScaleZ') {
                scale.z = finalValue;
            }

            boneTransform.boneNode.setLocalPosition(position);
            boneTransform.boneNode.setLocalScale(scale);
        }
        let bone = boneTransform.bone;
        console.log(`${bone.name}.${bone.type}`);
    }
}

function showUI() {
    let gui = new dat.GUI();


    // 脸部参数
    let parameters = femaleFaceData.face;
    let parameterCount = parameters.length;

    for (let i = 0; i < parameterCount; i++) {
        let parameter = parameters[i];
        let folder = gui.addFolder(parameter.name);
        if (parameter.type === "None") {
            let group = {};
            for (let j = 0; j < parameter.properties.length; j++) {
                let valueType = parameter.values[j];
                let _valueType = valueTypes[valueType];
                let valueName = valueNames[valueType];
                group[_valueType] = 0.5;
                folder.add(group, _valueType, 0, 1).name(valueName).onChange(value => {
                    adjustBone(parameter.properties[j], value);
                });
            }
        } else {
            let group = {x: 0.5, y: 0.5};
            folder.add(group, "x", 0, 1).onChange(x => {
                adjustBone(parameter.x, x);
            });
            folder.add(group, "y", 0, 1).onChange(y => {
                adjustBone(parameter.y, y);
            });
        }
    }
}

async function run() {
    {
        // create a PlayCanvas application
        const canvas = document.getElementById('application');
        const app = new pc.Application(canvas, {
            keyboard: new pc.Keyboard(window),
            graphicsDeviceOptions: {
                'antialias': true,
                'alpha': false,
                'preserveDrawingBuffer': false,
                'preferWebGl2': true
            },
        });

        // fill the available space at full resolution
        app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
        app.setCanvasResolution(pc.RESOLUTION_AUTO);

        // ensure canvas is resized when window changes size
        window.addEventListener('resize', () => app.resizeCanvas());

        // create camera entity
        const camera = new pc.Entity('camera');
        camera.addComponent('camera', {
            clearColor: new pc.Color(0, 0, 0, 1)
        });
        app.root.addChild(camera);
        camera.setPosition(0, 1.72, 0.3);

        // create directional light entity
        const light = new pc.Entity('light');
        light.addComponent('light');
        app.root.addChild(light);
        light.setEulerAngles(45, 0, 0);


        app.assets.loadFromUrl('./character-customization/female-face/female-face.json', 'model', function (err, asset) {
            if (err) {
                console.log(err);
                return;
            }

            if (asset) {
                const faceModel = new pc.Entity('Face');
                faceModel.setEulerAngles(0, 180, 0);
                app.root.addChild(faceModel);

                faceModel.addComponent('model', {
                    type: 'asset',
                    asset: asset,
                });

                let boneMap = new Map();

                /**
                 * @type {pc.SkinInstance[]}
                 */
                let skinInstance = faceModel.model.model.skinInstances[0];
                let bones = skinInstance.bones;
                for (let i = 0; i < bones.length; i++) {
                    boneMap.set(bones[i].name, bones[i]);
                }

                for (let i = 0; i < femaleFaceData.bones.length; i++) {
                    let bone = femaleFaceData.bones[i];
                    let boneName = bone.name;
                    let boneNode = boneMap.get(boneName);

                    if(!boneNode) {
                        // 不是骨骼, 是一个组用于改变整体
                        boneNode = faceModel.model.model.graph.findByName(boneName);
                    }

                    let defaultValue = 0;
                    let minValue = bone.minValue;
                    let maxValue = bone.maxValue;
                    if (bone.type === 'PositionX') {
                        defaultValue = boneNode.getLocalPosition().x;
                        minValue = minValue * -100;
                        maxValue = maxValue * -100;
                    }
                    else if (bone.type === 'PositionY') {
                        defaultValue = boneNode.getLocalPosition().y;
                        minValue = minValue * 100;
                        maxValue = maxValue * 100;
                    }
                    else if (bone.type === 'PositionZ') {
                        defaultValue = boneNode.getLocalPosition().z;
                        minValue = minValue * 100;
                        maxValue = maxValue * 100;
                    }
                    else if (bone.type === 'ScaleX')
                        defaultValue = boneNode.getLocalScale().x;
                    else if (bone.type === 'ScaleY')
                        defaultValue = boneNode.getLocalScale().y;
                    else if (bone.type === 'ScaleZ')
                        defaultValue = boneNode.getLocalScale().z;
                    else if (bone.type === 'Rotation') {
                        defaultValue = boneNode.getLocalRotation();
                        minValue = new pc.Quat(minValue[0], minValue[1], minValue[2], minValue[3]);
                        maxValue = new pc.Quat(maxValue[0], maxValue[1], maxValue[2], maxValue[3]);
                    }

                    let boneTransform = {
                        defaultValue: defaultValue,
                        boneNode: boneNode,
                        bone: bone,
                        minValue: minValue,
                        maxValue: maxValue
                    };

                    //console.log(`${boneName}.${bone.type}: min: ${boneTransform.minValue}, default: ${defaultValue}, max: ${boneTransform.maxValue}`);

                    boneTransforms.push(boneTransform);
                }

                showUI();
            }
        })

        app.start();
    }
}

run();