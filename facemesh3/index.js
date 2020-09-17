import {TRIANGULATION} from './triangulation.js'
import {Wavefront} from "./wavefront.js";
import {Stats} from "./stats.js";
import {Show3d} from "./show3d.js";

let saveAsObjFile = false;
let doStats = false;

function download(url, filename) {
    const anchor = document.createElement('a');
    anchor.setAttribute('href', url);
    anchor.setAttribute('download', filename);
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
}

async function run() {
    await tf.setBackend('cpu');

    let model = await facemesh.load();

    let image = document.getElementById('image');
    const predictions = await model.estimateFaces(image);

    if (!predictions || predictions.length === 0)
        return;

    console.log(predictions);

    let prediction = predictions[0];

    if(doStats){
        let stats = new Stats();
        stats.statsMesh(prediction.mesh);
        stats.statsMesh(prediction.scaledMesh);
    }

    if (saveAsObjFile) {
        let wavefront = new Wavefront(prediction.mesh, TRIANGULATION);
        let objFile = wavefront.serialize();
        let blob = new Blob([objFile], {type: 'text/html'});
        let url = URL.createObjectURL(blob);
        download(url, 'faceMesh.obj')
    }

    {
        let canvas = document.getElementById('application');
        let show3d = new Show3d(canvas, image, prediction.scaledMesh, TRIANGULATION);
        show3d.initialize(function () {
            show3d.createCamera();
            show3d.createImagePlane();
            show3d.createFaceModel();
            show3d.start();
        });
    }

    document.body.removeChild(image);
}

run();