# facemesh
* 模型  
代码中直接访问以下4个链接:  
```
https://tfhub.dev/tensorflow/tfjs-model/blazeface/1/default/1/model.json?tfjs-format=file
https://tfhub.dev/mediapipe/tfjs-model/facemesh/1/default/1/model.json?tfjs-format=file
https://tfhub.dev/tensorflow/tfjs-model/blazeface/1/default/1/group1-shard1of1.bin?tfjs-format=file
https://tfhub.dev/mediapipe/tfjs-model/facemesh/1/default/1/group1-shard1of1.bin?tfjs-format=file
```
这4个链接会重定向到下面这4个链接
```
https://storage.googleapis.com/tfhub-tfjs-modules/tensorflow/tfjs-model/blazeface/1/default/1/model.json
https://storage.googleapis.com/tfhub-tfjs-modules/mediapipe/tfjs-model/facemesh/1/default/1/model.json
https://storage.googleapis.com/tfhub-tfjs-modules/tensorflow/tfjs-model/blazeface/1/default/1/group1-shard1of1.bin
https://storage.googleapis.com/tfhub-tfjs-modules/mediapipe/tfjs-model/facemesh/1/default/1/group1-shard1of1.bin
```

可以看到区别只在于把```tfhub.dev```替换成```storage.googleapis.com/tfhub-tfjs-modules```
并且```tfhub.dev```无法正常访问, ```storage.googleapis.com```反而可以

## 数据结构
* Mesh  
   * Mesh是顶点数组, 每个元素是一个number数组, 包含3个坐标值
   * x和y的范围在0~192, 原点在图片的左上角, 任何大小的图片都会被归一化到192x192
* Scaled Mesh
   * 和Mesh结构一样
   * x和y的范围和图片的宽和高一致
   * 这个数据可以直接当成UV使用
* 三角形信息(Indices)
   * 在demo下的triangulation.js内
* UV
   * 在src/uv_coords.ts内
   * 对应的贴图是mesh_map.jpg