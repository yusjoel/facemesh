
/**
 * 使用PlayCanvas显示脸部3D模型
 * @param canvas {Element} 画布
 * @param image {HTMLImageElement} 脸部图片
 * @param vertices {number[][]} 脸部特征点
 * @param indices {number[]} 三角面索引
 * @constructor
 */
export function Show3d(canvas, image, vertices, indices) {
    this.canvas = canvas;
    this.image = image;
    this.vertexCount = vertices.length;
    this.positions = new Float32Array(this.vertexCount * 3);
    for(let i = 0; i < this.vertexCount; i++) {
        this.positions[i * 3] = vertices[i][0] - image.width / 2;
        this.positions[i * 3 + 1] = vertices[i][1] - image.height / 2;
        this.positions[i * 3 + 2] = vertices[i][2] - 20;
    }

    this.uvs = new Float32Array(this.vertexCount * 2);
    for(let i = 0; i < this.vertexCount; i++) {
        this.uvs[i * 2] = vertices[i][0] / this.image.width;
        this.uvs[i * 2 + 1] = 1 - vertices[i][1] / this.image.height;
    }
    this.indices = indices;
    this.imageAsset = null;

    this.cameraDistance = 800;
}

// load a script
Show3d.prototype.loadScriptAsync = function(url, doneCallback) {
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

Show3d.prototype.initialize = function (callback) {
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

    let self = this;
    this.loadScripts(['unlit-texture.js'], function () {
        self.loadImage(function (asset) {
            self.imageAsset = asset;
            callback();
        });
    });
};

Show3d.prototype.createCamera = function() {
    // create camera entity
    const camera = new pc.Entity('camera');
    camera.addComponent('camera', {
        clearColor: new pc.Color(0.1, 0.1, 0.1)
    });
    pc.app.root.addChild(camera);
    camera.setPosition(0, 0, this.cameraDistance);

    let speed = 1;
    let theta = 0;

    let self = this;
    pc.app.on('update', function (dt) {
        if (pc.app.keyboard.isPressed(pc.KEY_LEFT))
            theta += dt * speed;
        else if (pc.app.keyboard.isPressed(pc.KEY_RIGHT))
            theta -= dt * speed;

        camera.setPosition(Math.sin(theta) * self.cameraDistance, 0, Math.cos(theta) * self.cameraDistance);
        camera.lookAt(0, 0, 0, 0, 1, 0);
    });
};

Show3d.prototype.createImagePlane = function() {
    const plane = new pc.Entity('Plane');
    plane.setEulerAngles(90, 0, 0);
    plane.setLocalScale(this.image.width, 1, this.image.height);
    pc.app.root.addChild(plane);

    plane.addComponent('model', {
        type: 'plane'
    });
    plane.addComponent('script');
    plane.script.create('unlitTexture', {attributes: {
            mainTexture: this.imageAsset
        }});
}

Show3d.prototype.createFaceModel = function() {
    const face = new pc.Entity('Face');
    pc.app.root.addChild(face);
    face.setEulerAngles(0, 180, 180);
    face.setPosition(0, 1, 0);

    let root = new pc.GraphNode();
    let model = new pc.Model();
    model.graph = root;

    let mesh = new pc.Mesh(pc.app.graphicsDevice);
    mesh.setPositions(this.positions);
    mesh.setUvs(0, this.uvs);
    mesh.setIndices(this.indices);
    mesh.update();

    let material = new pc.StandardMaterial();
    let node = new pc.GraphNode();
    let meshInstance = new pc.MeshInstance(node, mesh, material);

    root.addChild(node);
    model.meshInstances.push(meshInstance);
    model.getGraph().syncHierarchy();

    //material.emissive = new pc.Color(1, 0, 0);
    //model.generateWireframe();
    //meshInstance.renderStyle = pc.RENDERSTYLE_WIREFRAME;

    face.addComponent('model');
    face.model.model = model;

    face.addComponent('script');
    face.script.create('unlitTexture', {attributes: {
            mainTexture: this.imageAsset
        }});
};

Show3d.prototype.start = function() {
    pc.app.start();
}

/**
 * 加载脚本, 需要在创建Application之后执行
 * @param urls string[] 脚本列表
 * @param callback {function}
 */
Show3d.prototype.loadScripts = function (urls, callback) {
    if(!urls || urls.length === 0)
        callback();

    let count = urls.length;
    function onLoaded() {
        count--;
        if(count <= 0)
            callback();
    }

    for (let i = 0; i < count; i++) {
        this.loadScriptAsync(urls[i], onLoaded);
    }
};

/**
 * 加载图片资产
 * @param callback {function}
 */
Show3d.prototype.loadImage = function (callback) {
    let asset = new pc.Asset('face image', 'texture', {url:this.image.src});
    asset.preload = true;
    pc.app.assets.add(asset);
    asset.ready(callback);
}

