/**
 * Wavefront OBJ格式
 * @param vertices {number[][]} 顶点
 * @param faces {number[]} 三角形面
 * @constructor
 */
export function Wavefront(vertices, faces) {
    this.vertices = vertices;
    this.faces = faces;
}

/**
 * 序列化为OBJ格式文本
 * @returns {string}
 */
Wavefront.prototype.serialize = function () {
    let obj = 'g default\n';

    let vertexCount = this.vertices.length;
    for (let i = 0; i < vertexCount; i++) {
        let vertex = this.vertices[i];
        obj += `v ${vertex[0]} ${vertex[1]} ${vertex[2]}\n`;
    }

    obj += 's off\n';
    obj += 'g face mesh\n';
    let faceCount = this.faces.length / 3;
    for (let i = 0; i < faceCount; i++) {
        obj += `f ${this.faces[i * 3] + 1} ${this.faces[i * 3 + 1] + 1} ${this.faces[i * 3 + 2] + 1}\n`
    }

    return obj;
}
