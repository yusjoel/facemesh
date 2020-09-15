import * as facemesh from '@tensorflow-models/facemesh';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-cpu';

//import * as facemesh from './node_modules/@tensorflow-models/facemesh';

//import * as tfjsWasm from '@tensorflow/tfjs-backend-wasm';

//tfjsWasm.setWasmPath('./tfjs-backend-wasm.wasm');

async function run() {
    await tf.setBackend('cpu');

    let model = await facemesh.load();
    //console.log(model);

    let image = document.getElementById('image');

    const predictions = await model.estimateFaces(image);
    console.log(predictions);
}

run();