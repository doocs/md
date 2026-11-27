# @doocs/dsh-md

DeepSeek Harness plugin for [doocs/md](https://github.com/doocs/md). The sidebar entry **doocs/md** opens the WeChat Markdown editor. Agent tools: `md_wechat_render` and `md_wechat_options`.

DeepSeek Harness 插件。侧边栏 **doocs/md** 打开微信 Markdown 编辑器；Agent 可调用 `md_wechat_render`、`md_wechat_options` 直接产出公众号 HTML。

## Install

Requires the DeepSeek Harness desktop app. `dsh` is not on `PATH`; use the CLI shipped with the app (`resources/runtime/cli/bin/dsh` or `dsh.cmd`).

```bash
dsh plugin --profile desktop add @doocs/dsh-md
```

Refresh the page (Ctrl+R). Restart DeepSeek Harness once after the first install or an upgrade so the host module reloads.

## Develop

This package is built from the [doocs/md](https://github.com/doocs/md) repository (`apps/dsh`). Local install:

```bash
pnpm dsh:install
```
