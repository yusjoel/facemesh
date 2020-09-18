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
                    asset: asset
                });
            }
        })

        app.start();
    }
}

run();