import {TRIANGULATION} from './triangulation.js'
import {Wavefront} from "./wavefront.js";

let saveAsObjFile = false;

function download(url, filename) {
    const anchor = document.createElement('a');
    anchor.setAttribute('href', url);
    anchor.setAttribute('download', filename);
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
}

// load a script
function loadScriptAsync(url, doneCallback) {
    var tag = document.createElement('script');
    tag.onload = function () {
        doneCallback();
    };
    tag.onerror = function () {
        throw new Error('failed to load ' + url);
    };
    tag.async = true;
    tag.src = url;
    document.head.appendChild(tag);
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

    if (saveAsObjFile) {
        let wavefront = new Wavefront(prediction.mesh, TRIANGULATION);
        let objFile = wavefront.serialize();
        let blob = new Blob([objFile], {type: 'text/html'});
        let url = URL.createObjectURL(blob);
        download(url, 'faceMesh.obj')
    }

    {
        // create a PlayCanvas application
        const canvas = document.getElementById('application');
        const app = new pc.Application(canvas);

        // fill the available space at full resolution
        app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
        app.setCanvasResolution(pc.RESOLUTION_AUTO);

        // ensure canvas is resized when window changes size
        window.addEventListener('resize', () => app.resizeCanvas());

        // create plane entity
        const plane = new pc.Entity('Plane');
        plane.setEulerAngles(90, 0, 0);
        plane.setLocalScale(image.width / 200, 1, image.height / 200);
        app.root.addChild(plane);

        let asset = new pc.Asset('face image', 'texture', {url:image.src});
        asset.preload = true;
        app.assets.add(asset);
        asset.ready(function (loadedAsset) {
            loadScriptAsync("unlit-texture.js", function () {
                plane.addComponent('model', {
                    type: 'plane'
                });
                plane.addComponent('script');
                plane.script.create('unlitTexture', {attributes: {
                    mainTexture: loadedAsset
                }});
            });
        })

        // create camera entity
        const camera = new pc.Entity('camera');
        camera.addComponent('camera', {
            clearColor: new pc.Color(0.1, 0.1, 0.1)
        });
        app.root.addChild(camera);
        camera.setPosition(0, 0, 3);

        // create directional light entity
        const light = new pc.Entity('light');
        light.addComponent('light');
        app.root.addChild(light);
        light.setEulerAngles(45, 0, 0);

        // rotate the box according to the delta time since the last frame
        //app.on('update', dt => plane.rotate(10 * dt, 20 * dt, 30 * dt));

        app.start();
    }

    document.body.removeChild(image);
}

run();