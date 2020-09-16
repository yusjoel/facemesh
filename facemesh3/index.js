import {TRIANGULATION} from './triangulation.js'
import {Wavefront} from "./wavefront.js";
import {Stats} from "./stats.js";

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

        const plane = new pc.Entity('Plane');
        plane.setEulerAngles(90, 0, 0);
        plane.setLocalScale(image.width, 1, image.height);
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

                plane.enabled = false;

                const face = new pc.Entity('Face');
                app.root.addChild(face);
                face.setEulerAngles(0, 180, 180);
                face.setPosition(0, 1, 0);

                let root = new pc.GraphNode();
                let model = new pc.Model();
                model.graph = root;

                let vertices = prediction.scaledMesh;
                let vertexCount = vertices.length;
                let positions = new Float32Array(vertexCount * 3);
                for(let i = 0; i < vertexCount; i++) {
                    positions[i * 3] = vertices[i][0] - image.width / 2;
                    positions[i * 3 + 1] = vertices[i][1] - image.height / 2;
                    positions[i * 3 + 2] = vertices[i][2] - 20;
                }

                let uvs = new Float32Array(vertexCount * 2);
                for(let i = 0; i < vertexCount; i++) {
                    uvs[i * 2] = vertices[i][0] / image.width;
                    uvs[i * 2 + 1] = 1 - vertices[i][1] / image.height;
                }

                let mesh = new pc.Mesh(app.graphicsDevice);
                mesh.setPositions(positions);
                mesh.setUvs(0, uvs);
                mesh.setIndices(TRIANGULATION);
                mesh.update();

                let material = new pc.StandardMaterial();
                material.emissive = new pc.Color(1, 0, 0);
                let node = new pc.GraphNode();
                let meshInstance = new pc.MeshInstance(node, mesh, material);

                root.addChild(node);
                model.meshInstances.push(meshInstance);
                model.getGraph().syncHierarchy();

                //model.generateWireframe();
                //meshInstance.renderStyle = pc.RENDERSTYLE_WIREFRAME;

                face.addComponent('model');
                face.model.model = model;

                face.addComponent('script');
                face.script.create('unlitTexture', {attributes: {
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
        camera.setPosition(0, 0, 800);

        let speed = 1;
        let theta = 0;
        let radius = 800;
        app.on('update', function (dt) {
            if (app.keyboard.isPressed(pc.KEY_LEFT))
                theta += dt * speed;
            else if (app.keyboard.isPressed(pc.KEY_RIGHT))
                theta -= dt * speed;

            camera.setPosition(Math.sin(theta) * radius, 0, Math.cos(theta) * radius);
            camera.lookAt(0, 0, 0, 0, 1, 0);
        });

        app.start();
    }

    document.body.removeChild(image);
}

run();