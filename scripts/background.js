// 초기 상태 설정
const initialState = {
  leftClicks: 0,
  rightClicks: 0,
  scrolls: 0,
  tabSwitches: 0,
  activeTab: null,
  openTabs: 0,
  copyActions: 0,
  pasteActions: 0,
  cutActions: 0,
  dragActions: 0,
  dropActions: 0,
  doubleClicks: 0,
  keyboardInputs: 0,
  formSubmits: 0,
  linkClicks: 0,
  historyNavigations: 0,
  zoomIns: 0,
  zoomOuts: 0,
  enterKeyPresses: 0, // enter 키 액션 추가
  wheelClicks: 0, // wheelclick 추가
  installId: null,
  actionLog: [] // 액션 로그 추가
};

let localActionLog = [];
let isSaving = false; // 저장 중인지 확인하는 플래그

// 액션 로그 업데이트 큐
let isActionLogUpdating = false;
const actionLogQueue = [];

// 큐에 액션 추가
function enqueueActionLogUpdate(operation) {
  actionLogQueue.push(operation);
  processActionLogQueue();
}

// 큐 처리 함수
function processActionLogQueue() {
  if (isActionLogUpdating || actionLogQueue.length === 0) return;

  isActionLogUpdating = true;
  const operation = actionLogQueue.shift();
  operation(() => {
    isActionLogUpdating = false;
    processActionLogQueue();
  });
}

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
    case 'incrementLeftClicks':
      incrementLeftClicks();
      break;
    case 'incrementRightClicks':
      incrementRightClicks();
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
    case 'incrementDragActions':
      incrementDragActions();
      break;
    case 'incrementDropActions':
      incrementDropActions();
      break;
    case 'incrementDoubleClicks':
      incrementDoubleClicks();
      break;
    case 'incrementKeyboardInputs':
      incrementKeyboardInputs();
      break;
    case 'incrementFormSubmits':
      incrementFormSubmits();
      break;
    case 'incrementLinkClicks':
      incrementLinkClicks();
      break;
    case 'incrementHistoryNavigations':
      incrementHistoryNavigations();
      break;
    case 'incrementZoomIns':
      incrementZoomIns();
      break;
    case 'incrementZoomOuts':
      incrementZoomOuts();
      break;
    case 'incrementEnterKeyPresses': // enter 키 액션 추가
      incrementEnterKeyPresses();
      break;
    case 'incrementWheelClicks': // wheelclick 추가
      incrementWheelClicks();
      break;
    case 'getStats':
      getStats(sendResponse);
      return true; // 비동기 응답을 위해 true 반환
  }
});

// 도메인 추출 함수
function extractDomain(url) {
  try {
    const domain = (new URL(url)).hostname;
    const parts = domain.split('.').slice(-3);
    if (parts[0] === 'www') parts.shift();
    return parts.join('.');
  } catch (error) {
    return 'unknown';
  }
}

// 액션 로그 안전하게 업데이트하는 함수
function safeUpdateActionLog(actionType, domain) {
  enqueueActionLogUpdate((done) => {
    chrome.storage.local.get([actionType, 'actionLog', 'installId'], (data) => {
      const newLogEntry = {
        action: actionType,
        time: new Date().toISOString(),
        installId: data.installId,
        domain: domain
      };
      const updatedActionLog = data.actionLog ? [...data.actionLog, newLogEntry] : [newLogEntry];
      const newData = {};
      newData[actionType] = (data[actionType] || 0) + 1;
      newData.actionLog = updatedActionLog;
      chrome.storage.local.set(newData, () => {
        addToLocalLog(actionType, data.installId, domain);
        done();
      });
    });
  });
}

// 각 액션에 대한 증가 함수
function incrementAction(actionType) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const domain = extractDomain(tabs[0]?.url || '');
    safeUpdateActionLog(actionType, domain);
  });
}

const incrementLeftClicks = () => incrementAction('leftClicks');
const incrementRightClicks = () => incrementAction('rightClicks');
const incrementScrolls = () => incrementAction('scrolls');
const incrementCopyActions = () => incrementAction('copyActions');
const incrementPasteActions = () => incrementAction('pasteActions');
const incrementCutActions = () => incrementAction('cutActions');
const incrementDragActions = () => incrementAction('dragActions');
const incrementDropActions = () => incrementAction('dropActions');
const incrementDoubleClicks = () => incrementAction('doubleClicks');
const incrementKeyboardInputs = () => incrementAction('keyboardInputs');
const incrementFormSubmits = () => incrementAction('formSubmits');
const incrementLinkClicks = () => incrementAction('linkClicks');
const incrementHistoryNavigations = () => incrementAction('historyNavigations');
const incrementZoomIns = () => incrementAction('zoomIns');
const incrementZoomOuts = () => incrementAction('zoomOuts');
const incrementEnterKeyPresses = () => incrementAction('enterKeyPresses'); // enter 키 액션 추가
const incrementWheelClicks = () => incrementAction('wheelClicks'); // wheelclick 추가

function incrementTabSwitches() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const domain = extractDomain(tabs[0]?.url || '');
    enqueueActionLogUpdate((done) => {
      chrome.storage.local.get(['tabSwitches', 'actionLog', 'installId'], (data) => {
        const newLogEntry = {
          action: 'tabSwitch',
          time: new Date().toISOString(),
          installId: data.installId,
          domain: domain
        };
        const updatedActionLog = data.actionLog ? [...data.actionLog, newLogEntry] : [newLogEntry];
        const newData = {
          tabSwitches: (data.tabSwitches || 0) + 1,
          actionLog: updatedActionLog
        };
        chrome.storage.local.set(newData, () => {
          addToLocalLog('tabSwitch', data.installId, domain);
          done();
        });
      });
    });
  });
}

function updateActiveTab(tabId) {
  chrome.tabs.get(tabId, (tab) => {
    const domain = extractDomain(tab?.url || '');
    enqueueActionLogUpdate((done) => {
      chrome.storage.local.get(['actionLog', 'installId'], (data) => {
        const newLogEntry = {
          action: 'updateActiveTab',
          time: new Date().toISOString(),
          installId: data.installId,
          domain: domain
        };
        const updatedActionLog = data.actionLog ? [...data.actionLog, newLogEntry] : [newLogEntry];
        chrome.storage.local.set({ activeTab: tabId, actionLog: updatedActionLog }, () => {
          addToLocalLog('updateActiveTab', data.installId, domain);
          done();
        });
      });
    });
  });
}

function incrementOpenTabs() {
  console.log('탭 생성');
  enqueueActionLogUpdate((done) => {
    chrome.storage.local.get(['openTabs', 'actionLog', 'installId'], (data) => {
      const newOpenTabs = (data.openTabs || 0) + 1;
      console.log('newOpenTabs');
      const newLogEntry = {
        action: 'openTab',
        time: new Date().toISOString(),
        installId: data.installId,
        domain: 'unknown'
      };
      const updatedActionLog = data.actionLog ? [...data.actionLog, newLogEntry] : [newLogEntry];
      chrome.storage.local.set({ openTabs: newOpenTabs, actionLog: updatedActionLog }, () => {
        addToLocalLog('openTab', data.installId, 'unknown');
        done();
      });
    });
  });
}

function decrementOpenTabs() {
  console.log('탭 삭제');
  enqueueActionLogUpdate((done) => {
    chrome.storage.local.get(['openTabs', 'actionLog', 'installId'], (data) => {
      const newOpenTabs = Math.max(0, (data.openTabs || 0) - 1);
      console.log('newOpenTabs');
      const newLogEntry = {
        action: 'closeTab',
        time: new Date().toISOString(),
        installId: data.installId,
        domain: 'unknown'
      };
      const updatedActionLog = data.actionLog ? [...data.actionLog, newLogEntry] : [newLogEntry];
      chrome.storage.local.set({ openTabs: newOpenTabs, actionLog: updatedActionLog }, () => {
        addToLocalLog('closeTab', data.installId, 'unknown');
        done();
      });
    });
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
    else {
      console.log("InstallID");
      console.log(data.installId);
      chrome.storage.local.set({ installId: data.installId });
    }
  });
}

// Firebase SDK 로드
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-analytics.js";

// Firebase 설정 가져오기
import { firebaseConfig } from './config.js';

// Firebase 초기화
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

// 로컬에 로그 추가
function addToLocalLog(action, installId, domain) {
  localActionLog.push({ action, time: new Date().toISOString(), installId, domain });

  // 로그가 100개 이상 쌓이면 Firestore에 저장
  if (localActionLog.length >= 100 && !isSaving) {
    saveLogsToFirestore();
  }
}

// Firestore에 로그 저장
function saveLogsToFirestore() {
  if (localActionLog.length === 0 || isSaving) return;

  isSaving = true;
  const logsToSave = [...localActionLog]; // 현재 로그의 복사본 생성
  localActionLog = []; // 로컬 로그 초기화

  const actionLogRef = collection(db, 'actionLogs');
  
  addDoc(actionLogRef, {
    logs: logsToSave,
    timestamp: serverTimestamp()
  })
  .then(() => {
    console.log("Logs written to Firestore");
    isSaving = false;
    
    // 저장 중에 새로 쌓인 로그가 있다면 다시 저장 시도
    if (localActionLog.length >= 100) {
      saveLogsToFirestore();
    }
  })
  .catch((error) => {
    console.error("Error writing logs: ", error);
    isSaving = false;
    // 저장에 실패한 로그를 다시 localActionLog에 추가
    localActionLog = [...logsToSave, ...localActionLog];
  });
}

// 브라우저 종료 시 로그 저장
chrome.runtime.onSuspend.addListener(() => {
  if (!isSaving && localActionLog.length > 0) {
    saveLogsToFirestore();
  }
});

