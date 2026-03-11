# 小红书Cookie及限流监控插件方案设计

本项目旨在开发一个能够一键获取小红书（web端/创作者中心）Cookie，并能在相关页面上对小红书笔记的“限流”状态进行自动或手动排查的 Chrome 浏览器扩展。

## User Review Required

> [!WARNING]
> 在着手开发前，针对核心功能我们需要确认以下两点（这决定了核心实现逻辑），请您审核并回复：

1.  **Cookie获取后的处理方式：**
    - 仅在插件弹出界面（Popup）显示并提供一键复制功能。 [已确认]
    
2.  **“限流状态”的具体判定标准：**
    - 采用 **API 隐藏字段监控法**。拦截小红书创作者中心 (`creator.xiaohongshu.com`) 的笔记列表接口响应数据，通过解析其中的隐藏字段 `level` 来判断推荐状态。 [已确认]
    - `Level 4`: 正常推荐
    - `Level 2`: 基本正常
    - `Level -1`: 隐形限流（违规）
    - `Level -102`: 严重限流

## Proposed Changes

### 核心目录结构
由于是基于 Chrome Manifest V3 的全新插件，基础结构规划如下：

-   `manifest.json`: 插件配置（权限配置包含 `cookies`, `activeTab`, `storage`, `webRequest`, `scripting` 以及 host permissions 指向小红书域名 `*://*.xiaohongshu.com/*` 和 `*://creator.xiaohongshu.com/*`）。
-   `background.js`: 后台服务脚本。用于处理全局Cookie读取和管理定时任务、跨域请求代理。
-   `popup/index.html & popup.js`: 插件弹出界面。用于显示Cookie内容、导出按钮，或限流检测的整体汇总状态。
-   `content/xhs_detect.js`: 内容脚本。当用户访问小红书网页或创作者中心时自动注入，提取笔记列表DOM或拦截相关的接口数据，并通过 UI 在笔记卡片旁注入“状态标识（如：✅正常，❌可能被限流）”。

### 核心逻辑设计

#### [NEW] 获取小红书 Cookie
-   **实现方式：**在 `background.js` 或 Popup 中通过调用 `chrome.cookies.getAll({ domain: ".xiaohongshu.com" })` 方法获取，将拼接后的 Cookie (`name=value;`) 通过 `chrome.storage.local` 保存，并在用户点击 Popup 时渲染。如有需要可将其一键复制/推送。

#### [NEW] 监控限流状态
-   **实现方式：**采用“API 拦截法”实现自动化检测：
    1.  **注入劫持脚本**：在 Content Script 中注入特制的注入式脚本，Hook 全局 `fetch` 和 `XMLHttpRequest`。
    2.  **过滤接口数据**：当用户访问创作者中心的作品管理页时，自动捕获笔记列表 API（如 `/web/explorer/author/notes/xxx`）的 JSON 响应。
    3.  **状态解析**：提取 JSON 中的 `level` 字段，并将其映射为对应的文字描述（正常/轻度限流/严重限流）。
    4.  **UI 反馈**：在网页原有笔记管理界面的卡片底部或顶部注入一个醒目的状态指示标签（绿灯/黄灯/红灯）。

## Verification Plan

### Manual Verification
1.  安装插件到 Chrome。
2.  登录网页版小红书或创作者服务平台。
3.  点击插件，验证是否成功读出包含关键字段（如 `web_session`, `a1`）的 Cookie。
4.  进入笔记列表或主页页，观察并点击检测功能，查看页面中笔记旁是否出现了正确的“限流/未见异常”判断状态。
