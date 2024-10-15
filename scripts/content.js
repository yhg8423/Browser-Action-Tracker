// 이벤트 리스너 설정
document.addEventListener('click', () => sendMessage('incrementClicks'));
document.addEventListener('scroll', () => sendMessage('incrementScrolls'));
document.addEventListener('copy', () => sendMessage('incrementCopyActions'));
document.addEventListener('paste', () => sendMessage('incrementPasteActions'));
document.addEventListener('cut', () => sendMessage('incrementCutActions'));

// 메시지 전송 함수
function sendMessage(action) {
  if (chrome.runtime && chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage({ action: action }, response => {
      if (chrome.runtime.lastError) {
        console.error('메시지 전송 오류:', chrome.runtime.lastError);
      }
    });
  }
}

// 페이지 로드 시 초기화 및 메시지 전송
chrome.runtime.sendMessage({ action: 'getStats' }, response => {
  console.log('현재 통계:', response);
});

console.log('Browser-Action-Tracker content script loaded');
