document.getElementById('surveyForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const surveyData = {
        age: parseInt(document.getElementById('age').value),
        nickname: document.getElementById('nickname').value,
        browserUsage: parseFloat(document.getElementById('browserUsage').value),
        occupation: document.getElementById('occupation').value,
        consent: document.getElementById('consent').checked
    };

    chrome.runtime.sendMessage({ action: 'saveSurveyData', data: surveyData }, function(response) {
        alert('설문 조사가 완료되었습니다. 감사합니다!');
        
        // 팝업에 설문 완료 메시지 전송
        chrome.runtime.sendMessage({ action: 'surveyCompleted' });
        
        window.close();
    });
});
