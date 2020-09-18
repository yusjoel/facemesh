import {femaleFaceData} from './character-customization/female.js'

async function run() {
    {
        // create a PlayCanvas application
        const canvas = document.getElementById('application');
        const app = new pc.Application(canvas, {
            keyboard: new pc.Keyboard(window)
        });

        // fill the available space at full resolution
        app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
        app.setCanvasResolution(pc.RESOLUTION_AUTO);

        // ensure canvas is resized when window changes size
        window.addEventListener('resize', () => app.resizeCanvas());

        // create camera entity
        const camera = new pc.Entity('camera');
        camera.addComponent('camera', {
            clearColor: new pc.Color(0.1, 0.1, 0.1)
        });
        app.root.addChild(camera);
        camera.setPosition(0, 1.72, 0.3);

        // create directional light entity
        const light = new pc.Entity('light');
        light.addComponent('light');
        app.root.addChild(light);
        light.setEulerAngles(45, 0, 0);


        app.assets.loadFromUrl('./character-customization/female-face/female-face.json', 'model', function (err, asset) {
            if(err) {
                console.log(err);
                return;
            }

            if(asset) {
                const faceModel = new pc.Entity('Face');
                faceModel.setEulerAngles(0, 180, 0);
                app.root.addChild(faceModel);

                faceModel.addComponent('model', {
                    type: 'asset',
                    asset: asset,
                });

                let boneMap = new Map();
                window.boneBrow = null;

                /**
                 * @type {pc.SkinInstance[]}
                 */
                let skinInstance = faceModel.model.model.skinInstances[0];
                let bones = skinInstance.bones;
                for (let i = 0; i < bones.length; i++) {
                    if(bones[i].name === 'Bone_Brow')
                        window.boneBrow = bones[i];

                    boneMap.set(bones[i].name, bones[i]);
                }

                let gui = new dat.GUI();
                let folder = gui.addFolder('Brow');
                let brow = {x: 1, y:1, z:1};
                folder.add(brow, "x", 0.5, 1.5).onChange(x => {
                    brow.x = x;
                    window.boneBrow.setLocalScale(brow.x, brow.y, brow.z);
                });
                folder.add(brow, "y", 0.5, 1.5).onChange(y => {
                    brow.y = y;
                    window.boneBrow.setLocalScale(brow.x, brow.y, brow.z);
                });
                folder.add(brow, "z", 0.5, 1.5).onChange(z => {
                    brow.z = z;
                    window.boneBrow.setLocalScale(brow.x, brow.y, brow.z);
                });
                folder.open();
            }
        })

        app.start();
    }
}

run();