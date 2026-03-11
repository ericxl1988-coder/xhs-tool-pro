// Background Service Worker v1.1.5
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_COOKIES') {
    chrome.cookies.getAll({ domain: ".xiaohongshu.com" }, (cookies) => {
      const cookieString = cookies.map(c => `${c.name}=${c.value}`).join('; ');
      sendResponse({ cookies: cookieString });
    });
    return true;
  }
});
// 移除不再需要的手动注入监听逻辑，改为由 manifest 处理
