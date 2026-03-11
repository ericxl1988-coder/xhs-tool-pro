# 小红书Cookie及限流监控插件开发任务清单

## 1. 需求调研与方案构思
- [x] 确认小红书Cookie的具体使用场景（在插件界面展示并提供复制）。
- [x] 明确笔记“限流状态”的判断标准（采用创作者中心 API 隐藏字段 `level` 监控法）。
- [ ] 完善并确认最终的 `implementation_plan.md`。

## 2. 插件基础架构搭建
- [x] 初始化 Chrome 插件项目目录（manifest v3）。
- [x] 配置必要的权限（`cookies`, `storage`, `webRequest` 等）。
- [x] 搭建 background service worker, popup UI 结构和 content scripts 基础。

## 3. 核心功能开发
### 3.1 获取小红书 Cookie
- [ ] 开发权限请求与域名 Cookie 提取逻辑。
- [ ] 在 Popup 中提供 Cookie 查看与一键复制/导出功能。

### 3.2 限流状态监控
- [ ] 编写注入脚本（Inject Script）以 Hook 网页 `fetch`/`XHR`。
- [ ] 在 Content Script 中实现长连接通信，接收来自注入脚本的拦截数据。
- [ ] 实现 `level` 字段到中文状态的转换逻辑。
- [ ] 动态在小红书创作者中心的作品管理列表页注入状态标签。

## 4. UI 界面与交互完善
- [ ] 美化 Popup 界面（采用现代化 Web UI 设计，简洁美观）。
- [ ] 增加相关的配置项（如：定期检测频率开关等）。

## 5. 联调测试与交付
- [ ] 在真实小红书环境进行端到端测试。
- [ ] 处理异常情况（如未登录、验证码拦截、API 接口变更）。
- [ ] 输出插件安装与使用指南文档。
