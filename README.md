## 概要
由于找不到一款完全符合自己需求的web-loading组件，没办法自己动手写一个得了，拓展jQuery插件，封装为layui组件。因时间短，组件及文档可能不是很完美，大家觉得有用就用用，有问题可以邮件给我：neusofts#neusoft.com（#换成@）

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
  // 详见：http://www.neusofts.com/demo/loading/layui_exts/loading/demo/index.html
});

```

## 兼容
兼容IE8+等所有浏览器，依赖jQuery。

## 相关
[官网](http://www.neusofts.com/demo/loading/layui_exts/loading/demo/index.html)