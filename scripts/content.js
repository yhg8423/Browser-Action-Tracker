// 이벤트 리스너 설정
document.addEventListener('click', (event) => {
  if (event.button === 0) {
    if (event.target.tagName === 'A') {
      console.log('link click');
      sendMessage('incrementLinkClicks');
    } else {
      console.log('left click');
      sendMessage('incrementLeftClicks');
    }
  } else if (event.detail === 2) {
    console.log('double click');
    sendMessage('incrementDoubleClicks');
  }
});

document.addEventListener('contextmenu', () => {
  console.log('right click');
  sendMessage('incrementRightClicks');
});

document.addEventListener('scroll', () => sendMessage('incrementScrolls'));
document.addEventListener('copy', () => sendMessage('incrementCopyActions'));
document.addEventListener('paste', () => sendMessage('incrementPasteActions'));
document.addEventListener('cut', () => sendMessage('incrementCutActions'));

document.addEventListener('dragstart', () => sendMessage('incrementDragActions'));
document.addEventListener('drop', () => sendMessage('incrementDropActions'));

document.addEventListener('keydown', () => sendMessage('incrementKeyboardInputs'));

document.addEventListener('submit', () => sendMessage('incrementFormSubmits'));

// document.addEventListener('click', (event) => {
//   if (event.target.tagName === 'A') {
//     event.preventDefault(); // 기본 동작 방지
//     sendMessage('incrementLinkClicks');
//     // 링크 클릭 후 약간의 지연을 두고 페이지 이동
//     setTimeout(() => {
//       window.location.href = event.target.href;
//     }, 100);
//   }
// });

window.addEventListener('popstate', () => sendMessage('incrementHistoryNavigations'));

window.addEventListener('wheel', (event) => {
  if (event.ctrlKey) {
    if (event.deltaY < 0) {
      sendMessage('incrementZoomIns');
    } else {
      sendMessage('incrementZoomOuts');
    }
  }
});

function sendMessage(action) {
  try {
    chrome.runtime.sendMessage({ action: action }, response => {
      if (chrome.runtime.lastError) {
        console.error('메시지 전송 오류:', chrome.runtime.lastError);
      }
    });
  } catch (error) {
    console.error('메시지 전송 중 예외 발생:', error);
  }
}

// 페이지 로드 시 초기화 및 메시지 전송
try {
  chrome.runtime.sendMessage({ action: 'getStats' }, response => {
    if (chrome.runtime.lastError) {
      console.error('통계 가져오기 오류:', chrome.runtime.lastError);
    } else {
      console.log('현재 통계:', response);
    }
  });
} catch (error) {
  console.error('초기화 중 예외 발생:', error);
}

console.log('브라우저-액션-트래커 콘텐츠 스크립트 로드됨');
