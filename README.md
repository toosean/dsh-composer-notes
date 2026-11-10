<p align="center">
  <img src="icon.svg" width="72" height="72" alt="Composer notes icon">
</p>

# Composer notes / 输入框笔记

一个给 **DeepSeek Harness (DSH)** 用的 composer 插件：在输入框的 **Full access** 旁边增加 **Note / 笔记** 按钮。保存的笔记可以从下拉菜单插入消息输入框；插入成功后该笔记会自动删除（一次性笔记）。

> 非官方第三方插件。开发和测试环境为 **DSH 0.2.2-rc.1**（Desktop `desktop` profile）。

## 功能

- 在 composer 工具栏的 Full access / Plan 控件右侧增加 Note 按钮（`conversation.input.left` slot，不替换任何现有控件）。
- 笔记菜单：最新笔记在前，末尾固定为 **New note / 新建笔记**。
- 新建笔记使用一个大的多行对话框；支持 `Cmd/Ctrl+Enter` 保存、`Esc`/取消/点击遮罩关闭。
- 点击笔记：把完整内容插入消息输入框的当前光标/选区（一次可撤销编辑），然后关闭菜单并**自动删除该笔记**。
- 插入失败（例如 composer 正在提交）不会删除笔记；插入成功但删除失败时会保留笔记并显示错误，避免静默丢失。
- 笔记跨 session 共享；保存在 profile 配置里，跨页面刷新和重启保留；不进入 session 事件或模型上下文。

## 要求

- DSH，版本与 **0.2.2-rc.1** 相同或兼容。
- 插件 Host 半侧 import `@deepseek-ai/schemastery`（DSH 安装自带，声明为 peerDependency）；Client 半侧使用平台自带的 `react` / `react-dom`。
- 从 Git/压缩包安装时可能需要联网解析依赖；离线安装见文末说明。

## 安装

### 方式 A：直接从 GitHub 安装（推荐）

1. 打开 DSH Web GUI，进入侧栏 **Plugins / 插件** 页面。
2. 点击 **Add plugin / 添加插件**，填入：

   ```text
   https://github.com/toosean/dsh-composer-notes.git
   ```

3. 按提示确认安装与信任，确认插件已启用。
4. 刷新页面（`Ctrl+R`），打开一个已有 session，Full access 右侧会出现 **Note / 笔记**。

更新时在该页面卸载后重新安装即可；Git 安装不需要单独下载源码。

### 方式 B：克隆后使用本地目录

```bash
git clone https://github.com/toosean/dsh-composer-notes.git
```

然后在 Plugins → Add plugin 中填入克隆目录的**绝对路径**（例如 `C:\Tools\dsh-composer-notes`）。

> 本地目录安装是 **link** 到目标 profile；之后不要移动或删除该目录，否则插件会失效。

### 方式 C：本地 tarball

在仓库目录执行：

```bash
npm pack
```

把生成的 `local-composer-notes-1.0.0.tgz` 复制到目标机，在 Add plugin 中填入它的绝对路径。tarball 安装会把它装进 profile 依赖，原文件之后可以删除。

### 方式 D：发布到 npm（可选）

`package.json` 当前是 `private: true`，包名 `@local/composer-notes` 也不是可发布的公共 scope。若要按包名安装：

1. 改成自己的 scope（如 `@toosean/dsh-composer-notes`）并递增版本号；
2. 视需要移除 `"private": true`，补齐 `license`、`repository` 等字段；
3. 发布后，在 Plugins → Add plugin 中填包名。

个人使用推荐方式 A。

## 使用

1. 打开一个已有 session（空白 New Session 页不渲染 composer 工具行）。
2. 点 **Note / 笔记** 打开菜单。
3. 点 **New note / 新建笔记**，输入内容并保存；新笔记出现在菜单顶部。
4. 点任意笔记：内容进入消息输入框，笔记随即从列表和存储中删除。
5. 再次打开菜单确认它已消失；刷新页面或重启后也不会回来。

## 数据与同步

- 笔记保存在当前 profile 的 `composer-notes` 条目配置中（volatile 字符串字段），由 DSH settings 服务写入该 profile 的 Cordis patch。
- 每台机器、每个 profile 各有一份笔记，**不跨机器同步**，也不包含在插件包/Git 仓库里。
- 如果当前 profile 的设置表单不可写，会退化到浏览器 localStorage（本页可用，跨重启不保证）。

### 把已有笔记带到新机器

- 推荐在新机器上重新创建；或
- 安装后，把源机器 `cordis.patch.yml` 中 `composer-notes` 条目的 `config.notes` 字符串复制到目标 profile 的同一条目。该值是 JSON 数组字符串，注意保留引号与转义。

  Windows Desktop 的 profile 路径通常为：

  ```text
  %USERPROFILE%\.dsh\profiles\<profile>\cordis.patch.yml
  ```

  这是手工修改 profile 配置；改坏了会影响启动，请先备份。

## 兼容性说明

Client 半侧依赖当前 DSH 的以下扩展点：

- `conversation.input.left` slot；
- 标准 props `inputActions` 的 `captureInsertion()` / `insertText(text, span)`；
- `ctx.configForms` 的 `get(entryId)`、`subscribe`、`set(field, value)`；
- 平台 module table 的 `react`、`react-dom`（`createPortal`）。

这些 API 随 DSH 版本变化；与 0.2.2-rc.1 差异较大的旧版/新版 DSH 可能无法正常加载。出现问题时先看浏览器控制台的 `slot entry crashed` 报错。

## 更新与卸载

- 更新：Plugins 页面找到 **Composer notes**，卸载后重新安装新版本/新 Git 提交。替换已安装包后可能需要重启应用加载新的 Client JS。
- 卸载：Plugins 页面卸载 **Composer notes**；profile patch 中可能保留一个 `composer-notes` 配置条目（无害，可手工删除）。

## 离线安装

如果目标机器完全离线，安装器可能无法联网解析 `@deepseek-ai/schemastery` peer。当前 DSH 安装自带该包；需要完全离线包时可以在 Issue 中说明目标 DSH 版本。

## 文件

- `index.js` — Host 半侧：`Config.notes`（volatile）与 settings 呈现配置。
- `client.js` — Client 半侧：按钮、菜单、新建对话框、插入与自动删除、存储适配。
- `cordis.patch.yml` — bundle patch，插入 `composer-notes` 行。
- `locale/en.json`、`locale/zh.json` — Plugins 页显示名与描述。
- `icon.svg` — 插件图标。
- `README.md`、`LICENSE` — 文档与 MIT 许可证。

无构建步骤；修改 `client.js` 后刷新页面即可，Host 半侧改动需按插件管理器提示重载/重启。

## License

[MIT](LICENSE)
