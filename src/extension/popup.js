document.addEventListener('DOMContentLoaded', () => {
    updateStats();
    
    document.getElementById('resetButton').addEventListener('click', resetStats);
});

function updateStats() {
    chrome.runtime.sendMessage({ action: 'getStats' }, (data) => {
        document.getElementById('clicks').textContent = `클릭: ${data.clicks || 0}`;
        document.getElementById('scrolls').textContent = `스크롤: ${data.scrolls || 0}`;
        document.getElementById('tabSwitches').textContent = `탭 전환: ${data.tabSwitches || 0}`;
        document.getElementById('openTabs').textContent = `열린 탭: ${data.openTabs || 0}`;
        document.getElementById('copyActions').textContent = `복사: ${data.copyActions || 0}`;
        document.getElementById('pasteActions').textContent = `붙여넣기: ${data.pasteActions || 0}`;
        document.getElementById('cutActions').textContent = `잘라내기: ${data.cutActions || 0}`;
    });
}

function resetStats() {
    chrome.runtime.sendMessage({ action: 'resetStats' }, () => {
        updateStats();
    });
}

chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && changes.actionLog) {
        chrome.runtime.sendMessage({ action: 'getStats' }, (data) => {
            console.log('Action Log:', data.actionLog);
        });
    }
});
