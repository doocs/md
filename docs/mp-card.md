# 微信公众号 ID 获取说明

## 为什么需要公众号 ID

在开发或运营过程中，有时需要获取某个公众号的唯一标识（即 **fakeid**），比如用于文章抓取、接口调用或做账号绑定。

## 获取公众号 ID 的方法

### 1. 打开公众号后台

进入 [微信公众平台](https://mp.weixin.qq.com)，用管理员账号登录。

### 2. 进入文章编辑器

点击【素材管理】→【新建图文素材】，进入文章编辑页面。

### 3. 添加公众号名片

在编辑器里点击【账号名片】，输入你要查询的公众号名称（如 **Doocs**），并插入到正文中。

### 4. 抓取网络请求

按下 `F12` 打开浏览器开发者工具，切换到 **Network（网络）** 标签。
在插入名片时，后台会发起一个接口请求，通常类似：

```
https://mp.weixin.qq.com/cgi-bin/searchbiz?action=search_biz&scene=1&begin=0...
```

### 5. 查找 fakeid

点击该请求，切换到 **Response（响应）**，可以看到返回的 JSON 数据。
其中会包含类似：

```json
{
  "list": [
    {
      "fakeid": "MzIxNjA5ODQ0OQ==",
      "nickname": "Doocs",
      "alias": "idoocs",
      "service_type": 1,
      "signature": "GitHub 开源组织 @Doocs 旗下唯一公众号，专注分享技术领域相关知识及行业最新资讯。",
      "verify_status": 1
    }
  ]
}
```

这里的 `fakeid` 就是该公众号的唯一标识。将获取到的公众号 ID（fakeid）保存下来，就可以在工具中使用啦。
