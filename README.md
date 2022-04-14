## 概要
由于找不到一款完全符合自己需求的web-loading组件，没办法自己动手写一个得了，拓展jQuery插件，封装为layui组件。因时间短，组件及文档可能不是很完美，大家觉得有用就用用，有问题可以邮件给我：neusofts#neusofts.com（#换成@，一直没注意，之前留的邮箱少了一个s，晕）

### 目录
```
  ├─layui
  │─layui_exts
      └─loading
        └─loading.js
```

### 使用说明
```
layui.config({
  base: '../js/layui_exts/'
}).extend({
  loading: 'loading/loading'
}).use(['jquery', 'loading'], function() {
  var $ = layui.$;
  // 详见文档及演示：https://www.neusofts.com/demo/loading/layui_exts/loading/demo/index.html
  // 一般为https协议，若无法打开，可尝试http
});

```

## 兼容
兼容IE8+等所有浏览器，依赖jQuery。

### 版本更新

v2.0 未来版本
- 待新增：自定义div对象（CSS3场景）； 
- 待处理：因img预加载导致loading显示延迟的问题；

v1.3（当前版本）
- 修复：父节点移除后导致loading实例报错的bug；
- 修复：afterHideAll默认覆盖全局配置，以最后调用为基准；
- 增强：img和text样式初始化设置；
- 新增：inheritRadius参数，是否继承父节点边框的值；
- 新增：文档的几个示例；

v1.2
- 新增：title配置，自定义div、img、text的hover显示内容；
- 修复：resize方法的处理逻辑及性能；
- 修复：有无img、text场景下的坐标计算错误bug；
- 兼容：IE8+、chrome、firefox、oprea、safari等浏览器；

v1.1
- 更新：某些场景下loading计算坐标错误的bug；
- 更新：无img时text加载延迟的bug；
- 兼容：safari的position计算方法不规范导致的bug；
- 兼容：IE8+、chrome、firefox、oprea、safari等浏览器；

v1.0
- 发布：组件发布

## 相关链接
[文档及演示](https://www.neusofts.com/demo/loading/layui_exts/loading/demo/index.html)
