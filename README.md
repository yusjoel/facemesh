# facemesh
tensorflow-models/facemesh试用

## facemesh1
1. 参照demo写出来的最小工程, 使用了node.js
1. 已经修正了2.3.0编译失败的问题
1. 如果访问不了tfhub.dev, 找到facemesh.esm.js, 将tfhub.dev替换为storage.googleapis.com/tfhub-tfjs-modules

## facemesh2
1. 使用script tag加载的最小工程
1. tfjs相关脚本来自unpkg.com, 版本2.3.0
1. facemesh来自cdn.jsdelivr.net, 版本0.0.4
1. 已经修改facemesh中的模型地址指向lib