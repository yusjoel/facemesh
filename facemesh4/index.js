import {Show3d} from './show3d.js'
import {FaceCustomization} from './character-customization/face-customization.js'

async function run() {
    {
        let faceCustomization = new FaceCustomization();

        let canvas = document.getElementById('application');
        let show3d = new Show3d(canvas);
        show3d.initialize(function () {
            show3d.createCamera();
            show3d.loadFaceModel('./character-customization/female-face/female-face.json', (entity) => {
                let rootNode = entity.model.model.graph;
                faceCustomization.bindBones(rootNode);
                faceCustomization.showUI();
            });
            show3d.start();
        });
    }
}

run();