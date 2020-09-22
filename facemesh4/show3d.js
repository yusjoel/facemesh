/**
 * 使用PlayCanvas显示脸部3D模型
 * @param canvas {Element} 画布
 * @constructor
 */
export function Show3d(canvas) {
    this.canvas = canvas;
}

// load a script
Show3d.prototype.loadScriptAsync = function (url, doneCallback) {
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

    if (callback)
        callback();

    // let self = this;
    // this.loadScripts(['unlit-texture.js'], function () {
    //     self.loadImage(function (asset) {
    //         self.imageAsset = asset;
    //         callback();
    //     });
    // });
};

Show3d.prototype.createCamera = function () {
    // create camera entity
    const camera = new pc.Entity('camera');
    camera.addComponent('camera', {
        clearColor: new pc.Color(0.1, 0.1, 0.1)
    });
    pc.app.root.addChild(camera);
    camera.setPosition(0, 1.72, -0.27);
    camera.rotate(0, 180, 0);

    // create directional light entity
    const light = new pc.Entity('light');
    light.addComponent('light');
    pc.app.root.addChild(light);
    light.setEulerAngles(-45, 0, 0);
};

Show3d.prototype.loadFaceModel = function (url, callback) {
    pc.app.assets.loadFromUrl(url, 'model', function (err, asset) {
        if (err) {
            console.log(err);
            return;
        }

        if (asset) {
            const faceModel = new pc.Entity('Face');
            pc.app.root.addChild(faceModel);

            faceModel.addComponent('model', {
                type: 'asset',
                asset: asset,
            });

            if (callback)
                callback(faceModel);
        }
    })
}

Show3d.prototype.start = function () {
    pc.app.start();
};

/**
 * 加载脚本, 需要在创建Application之后执行
 * @param urls string[] 脚本列表
 * @param callback {function}
 */
Show3d.prototype.loadScripts = function (urls, callback) {
    if (!urls || urls.length === 0)
        callback();

    let count = urls.length;

    function onLoaded() {
        count--;
        if (count <= 0)
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
    let asset = new pc.Asset('face image', 'texture', {url: this.image.src});
    asset.preload = true;
    pc.app.assets.add(asset);
    asset.ready(callback);
}

