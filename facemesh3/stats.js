/**
 * 统计工具类
 * @constructor
 */
export function Stats() {

}

/**
 * 统计顶点的最大最小值
 * @param mesh {number[][]} 顶点信息
 */
Stats.prototype.statsMesh = function (mesh) {
    let meshStats = {};
    let vertexCount = mesh.length;
    for(let i = 0; i < vertexCount; i++) {
        let x = mesh[i][0];
        let y = mesh[i][1];
        let z = mesh[i][2];
        if(i === 0) {
            meshStats.minX = meshStats.maxX = x;
            meshStats.minY = meshStats.maxY = y;
            meshStats.minZ = meshStats.maxZ = z;
        } else {
            if(meshStats.minX > x)
                meshStats.minX = x;
            if(meshStats.maxX < x)
                meshStats.maxX = x;

            if(meshStats.minY > y)
                meshStats.minY = y;
            if(meshStats.maxY < y)
                meshStats.maxY = y;

            if(meshStats.minZ > z)
                meshStats.minZ = z;
            if(meshStats.maxZ < z)
                meshStats.maxZ = z;
        }
    }

    console.log(meshStats);
};
