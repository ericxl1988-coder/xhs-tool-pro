# Submission Guide - XHS Tool Pro (Submission Case)

## Single Purpose (申明单一用途)
**Chinese**: XHS Tool Pro 专为小红书创作者设计，用于在本机浏览器端获取并展示其笔记的流量分级信息。
**English**: XHS Tool Pro is designed specifically for Xiaohongshu creators to retrieve and display their note's internal traffic level information within the local browser environment.

## Permission Justifications (权限使用理由)

### cookies
**Justification**: XHS Tool Pro needs access to creator.xiaohongshu.com cookies to extract and display authentication tokens (User ID, Session) to the creator. This is necessary for verifying the account identity and allowing users to copy their credentials for their own automation scripts.

### scripting & Host Permissions
**Justification**: The extension uses `chrome.scripting` to inject a clean interceptor into the MAIN world of Xiaohongshu's creator platform. This is required to hook into internal API responses (Fetch/XHR) to retrieve traffic analytics data that is not visible in the standard DOM, ensuring the creator has access to their own data metrics for better content planning.

---

## Technical Review Preparation (准备技术审查)
- All code is bundled within the package (no remote code execution).
- All `console.log` and debugging messages have been removed in the `src_v1.4.0` version.
- Content Security Policy (CSP) is strictly followed.
