/* jshint esversion: 6 */

/**
 * @class
 * @name UnlitTexture
 * @description 无光照纹理
 * @property {pc.Asset} mainTexture 散射纹理资源
 * @property {pc.Color} color 散射色
 */

let UnlitTexture = pc.createScript('unlitTexture');

UnlitTexture.attributes.add('mainTexture', {
    type: 'asset',
    assetType: 'texture',
    title: 'Main Texture'
});

UnlitTexture.attributes.add('color', {
    type: 'rgb',
    default: [1, 1, 1],
    title: 'Color'
});

UnlitTexture.prototype.apply = function (diffuseTexture) {
    let app = this.app;
    let model = this.entity.model.model;
    let gd = app.graphicsDevice;

    let mainTexture = diffuseTexture;

    if (!UnlitTexture.shader) {
        let vertexShader =
            "attribute vec3 aPosition;\n" +
            "attribute vec2 aUv0;\n" +
            "\n" +
            "uniform mat4 matrix_model;\n" +
            "uniform mat4 matrix_viewProjection;\n" +
            "\n" +
            "varying vec2 vUv0;\n" +
            "\n" +
            "void main(void)\n" +
            "{\n" +
            "    vUv0 = aUv0;\n" +
            "    gl_Position = matrix_viewProjection * matrix_model * vec4(aPosition, 1.0);\n" +
            "}";

        let fragmentShader =
            "precision " + gd.precision + " float;\n" +
            "varying vec2 vUv0;\n" +
            "\n" +
            "uniform sampler2D uMainTexture;\n" +
            "\n" +
            "uniform vec3 uColor;\n" +
            "\n" +
            "void main(void)\n" +
            "{\n" +
            "    vec4 color = texture2D(uMainTexture, vUv0);\n" +
            "    color.r *= uColor.r;\n" +
            "    color.g *= uColor.g;\n" +
            "    color.b *= uColor.b;\n" +
            "    gl_FragColor = color;\n" +
            "}";

        // A shader definition used to create a new shader.
        let shaderDefinition = {
            attributes: {
                aPosition: pc.SEMANTIC_POSITION,
                aUv0: pc.SEMANTIC_TEXCOORD0
            },
            vshader: vertexShader,
            fshader: fragmentShader
        };

        // Create the shader from the definition
        UnlitTexture.shader = new pc.Shader(gd, shaderDefinition);
    }

    if (!this.material) {
        // Create a new material and set the shader
        this.material = new pc.Material();
        this.material.shader = UnlitTexture.shader;
    }

    this.material.cull = pc.CULLFACE_NONE;

    // Set the main texture
    this.material.setParameter('uMainTexture', mainTexture);

    this.material.update();

    // Replace the material on the model with our new material
    model.meshInstances[0].material = this.material;
};

// initialize code called once per entity
UnlitTexture.prototype.initialize = function () {
    if (this.entity.model) {
        if (this.mainTexture)
            if (this.mainTexture.resource)
                this.apply(this.mainTexture.resource);
            else
                console.warn('mainTexture not loaded: ' + this.mainTexture.name);
    } else {
        console.error('not found model on entity ' + this.entity.name);
    }
};

UnlitTexture.prototype.update = function (dt) {
    if (!this.material) return;
    this.material.setParameter('uColor', [this.color.r, this.color.g, this.color.b]);
    this.material.update();
};
