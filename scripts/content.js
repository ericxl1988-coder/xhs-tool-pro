/**
 * content.js v1.3.0
 * 全链路诊断注入器 - 索引+属性双保底模式
 */
(function() {
    const VERSION = '1.3.0';
    console.log(`%c[XHS-Logic] 注入器 v${VERSION} 运行中...`, 'color: #ff2442; font-weight: bold;');

    const isContextValid = () => {
        try { return !!(chrome.runtime && chrome.runtime.id); } 
        catch (e) { return false; }
    };

    let allCapturedNotes = new Map(); // 使用 Map 去重存储所有抓到的笔记

    window.addEventListener('message', (e) => {
        if (!isContextValid() || e.source !== window || e.data?.type !== 'XHS_DATA') return;
        
        const notes = e.data.data?.data?.notes || e.data.data?.notes || [];
        if (notes.length > 0) {
            notes.forEach(n => allCapturedNotes.set(n.id, n));
            console.log(`[XHS-Logic] 当前数据池累计笔记: ${allCapturedNotes.size} 条`);
            renderUI();
        }
    });

    const levelMap = {
        '4': { text: '正常', color: '#4CAF50' },
        '2': { text: '及格', color: '#8BC34A' },
        '0': { text: '正常', color: '#4CAF50' },
        '-1': { text: '限流', color: '#FF9800' },
        '-102': { text: '屏弊', color: '#F44336' }
    };

    function renderUI() {
        if (!isContextValid()) return;
        chrome.storage.local.get(['detectEnabled'], (res) => {
            if (!isContextValid() || res.detectEnabled === false) return;
            
            const notesArray = Array.from(allCapturedNotes.values());
            
            // 诊断：扫描页面元素
            const covers = document.querySelectorAll('.content > div:has(img), .content > div:has(.cover)');
            console.log(`[XHS-Logic] 页面当前探测到封面容器: ${covers.length} 个`);

            // 策略 A: 索引对齐
            covers.forEach((cover, index) => {
                const note = notesArray[index];
                if (note) {
                    applyBadge(cover, note);
                }
            });

            // 策略 B: ID 属性兜底 (针对索引错位的情况)
            notesArray.forEach(note => {
                const badgeId = `xhs-v130-badge-${note.id}`;
                if (document.querySelector(`.${badgeId}`)) return;

                const anchor = document.querySelector(`a[href*="${note.id}"], [data-id*="${note.id}"], img[src*="${note.id}"]`);
                if (anchor) {
                    const container = anchor.closest('div:has(img)') || anchor.parentElement;
                    applyBadge(container, note);
                }
            });
        });
    }

    function applyBadge(mountPoint, note) {
        if (!mountPoint || mountPoint.querySelector(`.xhs-v130-badge-${note.id}`)) return;

        const level = note.level ?? note.permission_code ?? '4';
        const info = levelMap[String(level)] || { text: `分级(${level})`, color: '#999' };

        const badge = document.createElement('div');
        badge.className = `xhs-badge xhs-v130-badge-${note.id}`;
        badge.innerHTML = info.text;
        badge.style.cssText = `
            position: absolute;
            top: 2px;
            left: 2px;
            background: ${info.color}dd;
            color: white !important;
            padding: 1px 4px;
            font-size: 10px;
            font-weight: bold;
            z-index: 10001;
            border-radius: 3px;
            pointer-events: none;
            box-shadow: 0 1px 3px rgba(0,0,0,0.3);
            border: 0.5px solid rgba(255,255,255,0.4);
            white-space: nowrap;
        `;

        if (getComputedStyle(mountPoint).position === 'static') {
            mountPoint.style.position = 'relative';
        }
        mountPoint.appendChild(badge);
    }

    // 维持心跳
    setInterval(() => renderUI(), 2000);
})();
