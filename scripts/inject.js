/**
 * inject.js v1.3.0
 * 全链路日志诊断版 - 监控所有 API 通讯
 */
(function () {
    const PATTERN = /\/(api\/galaxy\/v\d\/creator\/note\/user\/posted|web\/explorer\/author\/notes|api\/galaxy\/v\d\/creator\/note\/query)/;

    if (window.__XHS_INJECTED_V3__) return;
    window.__XHS_INJECTED_V3__ = true;

    console.log('%c[XHS-Data] 拦截器 v1.3.0 已就位', 'color: #2196F3; font-weight: bold');

    const notify = (url, data) => {
        const notes = data?.data?.notes || data?.notes || [];
        console.log(`%c[XHS-Data] 拦截到 API: ${url.split('?')[0].split('/').pop()} | 包含笔记: ${notes.length}条`, 'color: #9c27b0');
        window.postMessage({ type: 'XHS_DATA', data: data, url: url }, '*');
    };

    // Hook XHR
    const XHR = XMLHttpRequest.prototype;
    const send = XHR.send;
    const open = XHR.open;

    XHR.open = function (method, url) {
        this._url = url;
        return open.apply(this, arguments);
    };

    XHR.send = function () {
        this.addEventListener('load', function () {
            if (this._url && this._url.match(PATTERN)) {
                try {
                    const res = JSON.parse(this.responseText);
                    notify(this._url, res);
                } catch (e) { }
            }
        });
        return send.apply(this, arguments);
    };

    // Hook Fetch
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
        const url = typeof args[0] === 'string' ? args[0] : args[0].url;
        try {
            const response = await originalFetch(...args);
            if (url && url.match(PATTERN)) {
                const clone = response.clone();
                clone.json().then(data => notify(url, data)).catch(() => { });
            }
            return response;
        } catch (err) {
            if (url && url.match(PATTERN)) {
                console.error(`[XHS-Data] Fetch 拦截失败: ${url}`, err);
            }
            throw err;
        }
    };
})();
