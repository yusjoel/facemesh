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

## facemesh3
1. 根据特征点创建脸部模型
   1. 三角面的数据来自于demo/triangulation.js
   2. 保存为Wavefront Obj格式
   3. OBJ格式中索引是基于1的, 所以要+1
2. 使用PlayCanvas显示脸部模型
   1. 创建了一个平面显示原图, 用于比较
   1. 为了对齐, 对顶点做了居中的处理
   1. UV数据没有使用uv_coords.ts内的数据, 直接用顶点的XY/图片的宽高, 贴图也使用原图
   1. 使用了无光照纯贴图的材质, 如果要使用其他材质还需要创建法线数据
   
## facemesh4
1. 参数化捏脸 (WIP)
   1. 脸部模型使用多个骨骼进行控制
   1. 将这些控制转成多个参数
   1. 通过facemesh获得的特征点计算这些参数, 并应用到模型上, 完成自动捏脸
1. 主要参考[基于神经网络捏脸](https://github.com/huailiang/face-nn)
    1. 借用了其中捏脸模块, 包括模型, 骨骼控制参数, 骨骼控制分组, 捏脸参数
    1. 该方案是最接生成捏脸参数, 我只能靠facemesh的特征点近似模拟