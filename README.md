# facemesh
tensorflow-models/facemesh试用

该工程创建时, facemesh的版本为0.0.4, 编译有问题。  
目前facemesh已经升级到0.0.5, 还停止了更新。  
从日志上来看, 0.0.4到0.0.5只是修改了一些测试用例和配置。  
facemesh的内容转到了face-landmarks-detection。  
两者代码基本一致, 只是更加通用, facemesh只是作为一个可选的模型, 并且增加了瞳孔的识别模型。

## facemesh1
1. 参照demo写出来的最小工程
1. 编译说明
    1. 请先确保安装了node.js, 安装包中应该附带npm
    1. 执行```node -v```确认版本号, 如v12.18.3
    1. 执行```npm -v```确认npm的版本号, 如6.14.6
    1. 安装yarn, 执行```npm install -g yarn```, yarn是替代npm的包管理工具, facemesh使用了yarn
    1. 执行```yarn -v```确认yarn版本号, 如1.22.5
    1. ```cd facemesh1```
    1. 执行```yarn```, 安装依赖包
    1. 执行```yarn build```编译
    1. 执行```yarn watch```调试 
1. backend
    1. tfjs-backend-wasm 2.3.0编译会报错
    1. 编译成功后, 使用webgl, cpu正常, wasm会报错
    1. 这里使用了cpu
1. 如果访问不了tfhub.dev, 找到facemesh.esm.js, 将tfhub.dev替换为storage.googleapis.com/tfhub-tfjs-modules， 或者使用浏览器插件进行重定向
1. 如果一切正常， 会在控制台打印predictions对象

## facemesh2
1. 不使用node.js进行编译, 直接使用已编译的脚本
1. tfjs相关脚本来自unpkg.com, 版本2.3.0
1. facemesh来自cdn.jsdelivr.net, 版本0.0.4
1. 已经修改facemesh中的模型地址指向lib
1. 直接打开index.html, 如果一切正常, 会在控制台打印predictions对象

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
3. 演示
   1. 打开index.html
   1. 等待片刻, 会进入到3D显示
   1. 按左右旋转镜头
   1. 测试图片有两张, 可以把face01改成face02查看
   1. 可以看到能够重建人脸的前部, 但是后部以及头发、耳朵等部分都无法重建
   
## facemesh4
1. 参数化捏脸
   1. 脸部模型使用多个骨骼进行控制
   1. 将这些控制转成多个参数
   1. 通过facemesh获得的特征点计算这些参数, 并应用到模型上, 完成自动捏脸
1. 主要参考[基于神经网络捏脸](https://github.com/huailiang/face-nn)
    1. 借用了其中捏脸模块, 包括模型, 骨骼控制参数, 骨骼控制分组, 捏脸参数
    1. 该方案是通过神经网络直接生成捏脸参数, 这里靠facemesh的特征点近似模拟
    1. 相关代码在character-customization文件夹下
1. 演示
    1. 打开index.html
    1. 右侧[控制]下有两个选项, FaceMesh用于打开/关闭使用facemesh创建的模型, FaceModel用于打开/关闭一个女性脸部模型
    1. [控制]下方有大量参数可以用于调整脸部模型, 这些值都是[0, 1]的数值, 并且默认都是0.5