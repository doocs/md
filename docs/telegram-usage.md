# Telegram 图床使用说明

## 如何获取 Bot Token 和 Chat ID

Telegram 图床需要两个参数：**Bot Token** 和 **Chat ID**。

### 1. 申请 Bot Token

- 在 Telegram 里搜索并打开机器人大号 [@BotFather](https://t.me/BotFather)。
- 发送 `/newbot`，然后按照提示给你的机器人取个名字和用户名（唯一的以 “bot” 结尾的用户名）。
- 完成后，BotFather 会返回一段类似 `123456789:ABCdefGHIjkl-MNOPqrSTUvwxYZ` 的字符串，这就是你的 **Bot Token**，复制保存到 `telegramConfig.token`。

### 2. 获取 Chat ID

Chat ID 决定图片发到哪个对话／频道／群组里，它有三种常见场景：

#### 发给自己的私聊

1. 在 Telegram 里搜索你的 bot 用户名，打开对话，点击“开始”（或发送 `/start`）。
2. 在浏览器里打开：

   ```
   https://api.telegram.org/bot<你的BotToken>/getUpdates
   ```

   将 `<你的BotToken>` 替换成上一步拿到的 Token。

3. 页面会返回 JSON，其中 `"chat":{"id":123456789,...}` 里的数字 `123456789` 就是你的 Chat ID。

#### 发到群组（推荐）

1. 先把 bot 添加进目标群，然后在群里发送一条消息给 bot（例如发 `/start`）。 如何将 bot 添加到群组？打开机器人，点击 `View Profile`，然后点击 `Add to Group`，选择你要添加的群组即可。
2. 同样用 `getUpdates` 接口查看返回的 JSON，取出 `"chat":{"id":-100987654321,...}` 里的那个负数（频道／超级群组 ID 通常是以 `-100` 开头）。

#### 发到频道

1. 把 bot 设为该频道的管理员（至少要有“写入消息”权限）。
2. 发送一条测试消息到该频道（比如在频道里发个图片或文字）。
3. 调用 `getUpdates` 接口检查返回的 JSON，里面同样会出现 `"chat":{"id":-1001234567890}`，这个就是你的频道 Chat ID。

```bash
# 假设你的 Token 是 123:ABC
curl https://api.telegram.org/bot123:ABC/getUpdates
```

响应中找 `"chat":{"id":-1001234567890}` → `chatId = -1001234567890`

## 最后

把上面获取到的 `Bot Token` 和 `Chat ID` 填到你在页面上的配置表单里，就可以用 Telegram 图床了。
