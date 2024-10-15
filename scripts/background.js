// 초기 상태 설정
const initialState = {
  clicks: 0,
  scrolls: 0,
  tabSwitches: 0,
  activeTab: null,
  openTabs: 0,
  copyActions: 0,
  pasteActions: 0,
  cutActions: 0,
  installId: null,
  actionLog: [] // 액션 로그 추가
};

// 상태 초기화
chrome.runtime.onInstalled.addListener(() => {
  initializeInstallId();
  chrome.storage.local.set(initialState);
  updateOpenTabs(); // 초기 열린 탭 수 설정
});

// 활성 탭 변경 감지
chrome.tabs.onActivated.addListener((activeInfo) => {
  incrementTabSwitches();
  updateActiveTab(activeInfo.tabId);
});

// 탭 생성 감지
chrome.tabs.onCreated.addListener(() => {
  incrementOpenTabs();
});

// 탭 삭제 감지
chrome.tabs.onRemoved.addListener(() => {
  decrementOpenTabs();
});

// 클립보드 작업을 감지하기 위해 콘텐츠 스크립트에서 메시지를 받음
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'incrementClicks':
      incrementClicks();
      break;
    case 'incrementScrolls':
      incrementScrolls();
      break;
    case 'incrementCopyActions':
      incrementCopyActions();
      break;
    case 'incrementPasteActions':
      incrementPasteActions();
      break;
    case 'incrementCutActions':
      incrementCutActions();
      break;
    case 'getStats':
      getStats(sendResponse);
      return true; // 비동기 응답을 위해 true 반환
  }
});

// 클릭 수 증가
function incrementClicks() {
  chrome.storage.local.get(['clicks', 'installId'], (data) => {
    chrome.storage.local.set({ clicks: data.clicks + 1 });
    saveActionLogToFirestore('click', data.installId);
  });
}

// 스크롤 수 증가
function incrementScrolls() {
  chrome.storage.local.get(['scrolls', 'actionLog', 'installId'], (data) => {
    const newLog = [...data.actionLog, { action: 'scroll', time: new Date().toISOString(), installId: data.installId }];
    chrome.storage.local.set({ scrolls: data.scrolls + 1, actionLog: newLog });
    saveActionLogToFirestore('scroll', data.installId);
  });
}

// 탭 전환 수 증가
function incrementTabSwitches() {
  chrome.storage.local.get(['tabSwitches', 'actionLog', 'installId'], (data) => {
    const newLog = [...data.actionLog, { action: 'tabSwitch', time: new Date().toISOString(), installId: data.installId }];
    chrome.storage.local.set({ tabSwitches: data.tabSwitches + 1, actionLog: newLog });
    saveActionLogToFirestore('tabSwitch', data.installId);
  });
}

// 활성 탭 업데이트
function updateActiveTab(tabId) {
  chrome.storage.local.get(['actionLog', 'installId'], (data) => {
    const newLog = [...data.actionLog, { action: 'updateActiveTab', time: new Date().toISOString(), installId: data.installId }];
    chrome.storage.local.set({ activeTab: tabId, actionLog: newLog });
    saveActionLogToFirestore('updateActiveTab', data.installId);
  });
}

// 열린 탭 수 증가
function incrementOpenTabs() {
  chrome.storage.local.get(['openTabs', 'actionLog', 'installId'], (data) => {
    const newLog = [...data.actionLog, { action: 'openTab', time: new Date().toISOString(), installId: data.installId }];
    chrome.storage.local.set({ openTabs: data.openTabs + 1, actionLog: newLog });
    saveActionLogToFirestore('openTab', data.installId);
  });
}

// 열린 탭 수 감소
function decrementOpenTabs() {
  chrome.storage.local.get(['openTabs', 'actionLog', 'installId'], (data) => {
    const newLog = [...data.actionLog, { action: 'closeTab', time: new Date().toISOString(), installId: data.installId }];
    chrome.storage.local.set({ openTabs: Math.max(0, data.openTabs - 1), actionLog: newLog });
    saveActionLogToFirestore('closeTab', data.installId);
  });
}

// 복사 작업 수 증가
function incrementCopyActions() {
  chrome.storage.local.get(['copyActions', 'actionLog', 'installId'], (data) => {
    const newLog = [...data.actionLog, { action: 'copy', time: new Date().toISOString(), installId: data.installId }];
    chrome.storage.local.set({ copyActions: data.copyActions + 1, actionLog: newLog });
    saveActionLogToFirestore('copy', data.installId);
  });
}

// 붙여넣기 작업 수 증가
function incrementPasteActions() {
  chrome.storage.local.get(['pasteActions', 'actionLog', 'installId'], (data) => {
    const newLog = [...data.actionLog, { action: 'paste', time: new Date().toISOString(), installId: data.installId }];
    chrome.storage.local.set({ pasteActions: data.pasteActions + 1, actionLog: newLog });
    saveActionLogToFirestore('paste', data.installId);
  });
}

// 잘라내기 작업 수 증가
function incrementCutActions() {
  chrome.storage.local.get(['cutActions', 'actionLog', 'installId'], (data) => {
    const newLog = [...data.actionLog, { action: 'cut', time: new Date().toISOString(), installId: data.installId }];
    chrome.storage.local.set({ cutActions: data.cutActions + 1, actionLog: newLog });
    saveActionLogToFirestore('cut', data.installId);
  });
}

// 통계 데이터 가져오기
function getStats(sendResponse) {
  chrome.storage.local.get(null, (data) => {
    sendResponse(data);
  });
}

// 열린 탭 수 초기화
function updateOpenTabs() {
  chrome.tabs.query({}, (tabs) => {
    chrome.storage.local.set({ openTabs: tabs.length });
  });
}

function generateInstallId() {
  return 'id_' + Math.random().toString(36).substr(2, 9);
}

function initializeInstallId() {
  chrome.storage.local.get('installId', (data) => {
    if (!data.installId) {
      const newInstallId = generateInstallId();
      chrome.storage.local.set({ installId: newInstallId });
    }
  });
}

// Firebase SDK 로드
importScripts('../firebase/firebase-app.js', '../firebase/firebase-firestore.js');

// Firebase 설정 가져오기
import firebaseConfig from './config.js';

// Firebase 초기화
firebase.initializeApp(firebaseConfig);

// Firestore 초기화
const db = firebase.firestore();

// actionLog를 Firestore에 저장하는 함수
function saveActionLogToFirestore(action, installId) {
  db.collection('actionLogs').add({
    action: action,
    time: firebase.firestore.FieldValue.serverTimestamp(),
    installId: installId
  })
  .then((docRef) => {
    console.log("Document written with ID: ", docRef.id);
  })
  .catch((error) => {
    console.error("Error adding document: ", error);
  });
}
