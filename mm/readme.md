# 说明

此目录是运行命令 `mm --template` 之后生成的 mockm 常用配置, 该命令做了以下事情:

在运行目录的 package.json 的 scripts 中添加命令 `"mm": "npx mockm --cwd=mm"`, 如果没有 package.json 文件, 会自动创建.

创建名为 mm 的目录, 文件说明如下, 如果存在则不覆盖:

```
mm/
  - api/ -- 手动创建的 api
  - httpData/ -- 请求记录, 一般不提交到版本库
  - apiWeb.json -- 从 UI 界面上创建的接口信息
  - util.js -- 一些公用方法
  - mm.config.js -- mockm 的配置文件
```

## 参考
- [mm 代码仓库](https://github.com/wll8/mockm/)
- [mm 文档](https://hongqiye.com/doc/mockm/)
- [mockjs 文档](http://wll8.gitee.io/mockjs-examples/)