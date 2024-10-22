document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.sync.get('surveyCompleted', (data) => {
        if (data.surveyCompleted) {
            showStats();
        } else {
            showSurveyPrompt();
        }
    });
});

function showSurveyPrompt() {
    document.getElementById('surveyPrompt').style.display = 'block';
    document.getElementById('statsContent').style.display = 'none';
    
    document.getElementById('goToSurvey').addEventListener('click', () => {
        chrome.tabs.create({ url: 'src/extension/survey.html' });
    });
}

function showStats() {
    document.getElementById('surveyPrompt').style.display = 'none';
    document.getElementById('statsContent').style.display = 'block';
    
    updateStats();
    
    document.getElementById('resetButton').addEventListener('click', resetStats);
}

function updateStats() {
    chrome.runtime.sendMessage({ action: 'getStats' }, (data) => {
        document.getElementById('leftClicks').textContent = `왼쪽 클릭: ${data.leftClicks || 0}`;
        document.getElementById('rightClicks').textContent = `오른쪽 클릭: ${data.rightClicks || 0}`;
        document.getElementById('doubleClicks').textContent = `더블 클릭: ${data.doubleClicks || 0}`;
        document.getElementById('dragActions').textContent = `드래그: ${data.dragActions || 0}`;
        document.getElementById('keyboardInputs').textContent = `키보드 입력: ${data.keyboardInputs || 0}`;
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

// 설문 조사 완료 후 팝업 업데이트를 위한 메시지 리스너
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'surveyCompleted') {
        showStats();
    }
});
