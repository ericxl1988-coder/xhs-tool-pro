document.addEventListener('DOMContentLoaded', () => {
    const rawBox = document.getElementById('cookieRaw');
    const mainCopyBtn = document.getElementById('mainCopyBtn');
    const toast = document.getElementById('toast');
    const detectSwitch = document.getElementById('detectSwitch');
    const toggleRaw = document.getElementById('toggleRaw');
    const logoImg = document.getElementById('app-logo');
    
    // 关键信息元素
    const elements = {
        userId: document.getElementById('val-userid'),
        session: document.getElementById('val-session'),
        a1: document.getElementById('val-a1')
    };

    // 1. 初始化设置与图片
    chrome.storage.local.get(['detectEnabled'], (result) => {
        detectSwitch.checked = result.detectEnabled !== false;
    });

    // 尝试加载生成的 Logo，如果不可用则保持默认
    fetch(chrome.runtime.getURL('xhs_tool_logo.png'))
        .then(() => logoImg.src = '../xhs_tool_logo.png')
        .catch(() => {});

    detectSwitch.addEventListener('change', () => {
        chrome.storage.local.set({ detectEnabled: detectSwitch.checked });
    });

    // 2. 原始数据展开/收起
    toggleRaw.addEventListener('click', () => {
        const isHidden = getComputedStyle(rawBox).display === 'none';
        rawBox.style.display = isHidden ? 'block' : 'none';
        toggleRaw.querySelector('svg').style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
    });

    // 3. 核心数据解析
    let cachedFields = {};

    chrome.runtime.sendMessage({ type: 'GET_COOKIES' }, (response) => {
        if (response && response.cookies) {
            const raw = response.cookies;
            rawBox.textContent = raw;
            cachedFields = parseCookie(raw);
            
            elements.userId.textContent = cachedFields.userId || 'Not found';
            elements.session.textContent = cachedFields.session ? cachedFields.session.substring(0, 12) + '...' : 'Not found';
            elements.a1.textContent = cachedFields.a1 ? cachedFields.a1.substring(0, 12) + '...' : 'Not found';
            
            if (!cachedFields.userId) elements.userId.style.color = '#ef4444';
        } else {
            rawBox.textContent = 'Please login to creator.xiaohongshu.com first.';
            Object.values(elements).forEach(el => el.textContent = '---');
        }
    });

    function parseCookie(str) {
        const res = {};
        str.split(';').forEach(item => {
            const [k, v] = item.split('=').map(s => s?.trim());
            if (k === 'x-user-id-creator.xiaohongshu.com') res.userId = v;
            if (k === 'web_session') res.session = v;
            if (k === 'a1') res.a1 = v;
        });
        return res;
    }

    // 4. 单项复制逻辑
    document.querySelectorAll('.copy-icon-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-target');
            let textToCopy = '';
            
            if (target === 'userid') textToCopy = cachedFields.userId;
            if (target === 'session') textToCopy = cachedFields.session;
            if (target === 'a1') textToCopy = cachedFields.a1;

            if (textToCopy) {
                navigator.clipboard.writeText(textToCopy).then(() => {
                    showToast(`Copied ${target.toUpperCase()}`);
                });
            }
        });
    });

    // 5. 全量复制
    mainCopyBtn.addEventListener('click', () => {
        const textToCopy = rawBox.textContent;
        if (textToCopy && !textToCopy.includes('Please login')) {
            navigator.clipboard.writeText(textToCopy).then(() => {
                showToast('Full profile copied');
            });
        }
    });

    function showToast(msg) {
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2000);
    }
});
