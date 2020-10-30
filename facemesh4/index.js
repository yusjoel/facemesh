import {Show3d} from './show3d.js'
import {FaceCustomization} from './character-customization/face-customization.js'
import {TRIANGULATION} from "./triangulation.js";

async function run() {
    await tf.setBackend('cpu');

    let model = await facemesh.load();

    let image = document.getElementById('image');
    const predictions = await model.estimateFaces(image);

    if (!predictions || predictions.length === 0)
        return;

    let prediction = predictions[0];
    console.log(prediction.annotations);


    {
        let faceCustomization = new FaceCustomization();

        let canvas = document.getElementById('application');
        let show3d = new Show3d(canvas);
        show3d.initialize(function () {
            show3d.createCamera();
            show3d.createFaceMesh(image, prediction.scaledMesh, TRIANGULATION, ()=> {
                show3d.loadFaceModel('./character-customization/female-face/female-face.json', (entity) => {
                    let rootNode = entity.model.model.graph;
                    faceCustomization.bindBones(rootNode);
                    faceCustomization.showUI(show3d);
                });
            });

            show3d.start();
        });
    }

    document.body.removeChild(image);
}

run();