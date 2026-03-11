 初始化变量
let currentModule = 1;
const totalModules = 3;
let surveyData = JSON.parse(localStorage.getItem('surveyData'))  {};

 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
     恢复已填写的数据
    restoreData();
    
     自动保存功能（输入时保存）
    document.querySelectorAll('input, select, textarea').forEach(el = {
        el.addEventListener('input', saveData);
    });

     开放性问题输入提示
    document.getElementById('suggestion1').addEventListener('blur', function() {
        if (this.value.trim()) {
            document.getElementById('suggestionTip').style.display = 'block';
        }
    });

     上一题下一题提交按钮事件
    document.getElementById('prevBtn').addEventListener('click', prevModule);
    document.getElementById('nextBtn').addEventListener('click', nextModule);
    document.getElementById('submitBtn').addEventListener('click', submitSurvey);

     调研截止提醒（模拟）
    const deadline = localStorage.getItem('surveyDeadline');
    if (deadline) {
        const today = new Date();
        const deadDate = new Date(deadline);
        const diffDays = Math.ceil((deadDate - today)  (1000  60  60  24));
        if (diffDays  0 && diffDays = 3) {
            alert(`提醒：调研即将在${diffDays}天后截止，请尽快完成填写！`);
        }
    }
});

 切换模块
function switchModule(moduleNum) {
     校验当前模块必填项（核心问题模块）
    if (currentModule === 2 && !validateRequired()) {
        alert('核心问题为必填项，请完成填写后再切换！');
        return;
    }

     隐藏所有模块，显示目标模块
    document.querySelectorAll('.survey-module').forEach((el, index) = {
        el.classList.add('d-none');
        el.classList.remove('active');
        document.querySelectorAll('.list-group-item')[index].classList.remove('active');
    });
    document.getElementById(`module${moduleNum}`).classList.remove('d-none');
    document.getElementById(`module${moduleNum}`).classList.add('active');
    document.querySelectorAll('.list-group-item')[moduleNum - 1].classList.add('active');

     更新进度条
    currentModule = moduleNum;
    const progress = (moduleNum  totalModules)  100;
    const progressText = {
        1 '13 基本信息',
        2 '23 排班满意度核心问题',
        3 '33 开放性问题'
    };
    const progressBar = document.getElementById('progressBar');
    progressBar.style.width = `${progress}%`;
    progressBar.textContent = progressText[moduleNum];

     显示隐藏提交按钮
    if (moduleNum === totalModules) {
        document.getElementById('nextBtn').classList.add('d-none');
        document.getElementById('submitBtn').classList.remove('d-none');
    } else {
        document.getElementById('nextBtn').classList.remove('d-none');
        document.getElementById('submitBtn').classList.add('d-none');
    }

     上一题按钮状态
    document.getElementById('prevBtn').disabled = moduleNum === 1;
}

 上一题
function prevModule() {
    if (currentModule  1) {
        switchModule(currentModule - 1);
    }
}

 下一题
function nextModule() {
    if (currentModule  totalModules) {
        switchModule(currentModule + 1);
    }
}

 校验必填项（核心问题）
function validateRequired() {
    const s1 = document.querySelector('input[name=satisfaction1]checked');
    const s2 = document.querySelector('input[name=satisfaction2]checked');
    return !!s1 && !!s2;
}

 保存数据到localStorage
function saveData() {
    surveyData.dept = document.getElementById('dept').value;
    surveyData.workDuration = document.getElementById('workDuration').value;
    surveyData.satisfaction1 = document.querySelector('input[name=satisfaction1]checked').value  '';
    surveyData.satisfaction2 = document.querySelector('input[name=satisfaction2]checked').value  '';
    surveyData.suggestion1 = document.getElementById('suggestion1').value;
    surveyData.suggestion2 = document.getElementById('suggestion2').value;
    localStorage.setItem('surveyData', JSON.stringify(surveyData));
}

 恢复已填写的数据
function restoreData() {
    if (surveyData.dept) document.getElementById('dept').value = surveyData.dept;
    if (surveyData.workDuration) document.getElementById('workDuration').value = surveyData.workDuration;
    if (surveyData.satisfaction1) {
        document.querySelector(`input[name=satisfaction1][value=${surveyData.satisfaction1}]`).checked = true;
    }
    if (surveyData.satisfaction2) {
        document.querySelector(`input[name=satisfaction2][value=${surveyData.satisfaction2}]`).checked = true;
    }
    if (surveyData.suggestion1) document.getElementById('suggestion1').value = surveyData.suggestion1;
    if (surveyData.suggestion2) document.getElementById('suggestion2').value = surveyData.suggestion2;
}

 提交问卷
function submitSurvey() {
     最终校验
    if (!validateRequired()) {
        alert('核心问题为必填项，请完成填写后再提交！');
        return;
    }

     保存最终数据
    saveData();

     存储提交状态
    localStorage.setItem('surveySubmitted', 'true');

     收集到管理员数据（模拟）
    let allSurveyData = JSON.parse(localStorage.getItem('allSurveyData'))  [];
    allSurveyData.push({
        ...surveyData,
        submitTime new Date().toLocaleString()
    });
    localStorage.setItem('allSurveyData', JSON.stringify(allSurveyData));

     跳转到提交成功页
    window.location.href = 'success.html';
}