// 이벤트 리스너 설정
let clickTimer = null;
const doubleClickDelay = 300; // 더블클릭 간격 (밀리초)

let isDragging = false;

document.addEventListener('mousedown', () => {
  isDragging = false;
});

document.addEventListener('mousemove', () => {
  isDragging = true;
});

document.addEventListener('click', (event) => {
  if (isDragging) {
    isDragging = false;
    sendMessage('incrementDragActions');
    return;
  }
  console.log(event.button);
  if (clickTimer === null) {
    clickTimer = setTimeout(() => {
      // 단일 클릭 처리
      if (event.button === 0) {
        if (event.target.tagName === 'A') {
          console.log('링크 클릭');
          sendMessage('incrementLinkClicks');
        } else {
          console.log('왼쪽 클릭');
          sendMessage('incrementLeftClicks');
        }
      }
      clickTimer = null;
    }, doubleClickDelay);
  } else {
    // 더블클릭 감지
    clearTimeout(clickTimer);
    clickTimer = null;
    console.log('더블 클릭');
    sendMessage('incrementDoubleClicks');
  }
});

document.addEventListener('auxclick', (event) => {
  if (event.button === 1) {
    console.log('휠 클릭');
    sendMessage('incrementWheelClicks');
  }
});

document.addEventListener('contextmenu', () => {
  console.log('right click');
  sendMessage('incrementRightClicks');
});

let scrollTimeout;
document.addEventListener('scroll', () => {
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    sendMessage('incrementScrolls');
  }, 300); // 300ms 후에 스크롤 이벤트 기록
});

document.addEventListener('copy', () => sendMessage('incrementCopyActions'));
document.addEventListener('paste', () => sendMessage('incrementPasteActions'));
document.addEventListener('cut', () => sendMessage('incrementCutActions'));

document.addEventListener('dragstart', () => sendMessage('incrementDragActions'));
document.addEventListener('drop', () => sendMessage('incrementDropActions'));

document.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    console.log('엔터 키 누름');
    sendMessage('incrementEnterKeyPresses');
  }
  else if (!event.ctrlKey && !event.metaKey) {
    sendMessage('incrementKeyboardInputs');
  }
});

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

window.addEventListener('popstate', () => {
  console.log('history navigation');
  sendMessage('incrementHistoryNavigations');
});

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
        // console.error('메시지 전송 오류:', chrome.runtime.lastError);
      }
    });
  } catch (error) {
    // console.error('메시지 전송 중 예외 발생:', error);
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
