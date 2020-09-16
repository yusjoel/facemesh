import {TRIANGULATION} from './triangulation.js'

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
    console.log(predictions);

    let obj = 'g default\n';
    if(predictions.length > 0) {
        let prediction = predictions[0];
        let vertexCount = prediction.mesh.length;
        for(let i = 0; i < vertexCount; i++) {
            let mesh = prediction.mesh[i];
            obj += `v ${mesh[0]} ${mesh[1]} ${mesh[2]}\n`;
        }

        obj += 's off\n';
        obj += 'g face mesh\n';
        let triangleCount = TRIANGULATION.length / 3;
        for(let i = 0; i < triangleCount; i++) {
            obj += `f ${TRIANGULATION[i * 3] + 1} ${TRIANGULATION[i * 3 + 1] + 1} ${TRIANGULATION[i * 3 + 2] + 1}\n`
        }

        let blob = new Blob([obj], {type: 'text/html'});
        let url = URL.createObjectURL(blob);
        download(url, 'faceMesh.obj')
        //console.log(obj);
    }
}

run();