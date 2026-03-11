// 初始化管理员账号密码（实际生产环境需加密存储）
const ADMIN_USER = 'admin';
const ADMIN_PWD = 'admin123';

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 登录按钮事件
    document.getElementById('loginBtn').addEventListener('click', login);
    // 退出登录按钮事件
    document.getElementById('logoutBtn').addEventListener('click', logout);
    // 导出Excel按钮事件
    document.getElementById('exportExcelBtn').addEventListener('click', exportExcel);
    // 保存设置按钮事件
    document.getElementById('saveSettingBtn').addEventListener('click', saveSetting);
    // 筛选按钮事件
    document.getElementById('filterBtn').addEventListener('click', filterData);
    // 修改问卷按钮事件
    document.getElementById('editSurveyBtn').addEventListener('click', editSurvey);

    // 检查是否已登录
    if (localStorage.getItem('adminLoggedIn') === 'true') {
        showAdminSection();
    }
});

// 管理员登录
function login() {
    const user = document.getElementById('adminUser').value;
    const pwd = document.getElementById('adminPwd').value;

    if (!user || !pwd) {
        alert('账号和密码不能为空！');
        return;
    }

    if (user === ADMIN_USER && pwd === ADMIN_PWD) {
        localStorage.setItem('adminLoggedIn', 'true');
        showAdminSection();
        loadDataSummary();
    } else {
        alert('账号或密码错误！');
    }
}

// 退出登录
function logout() {
    localStorage.removeItem('adminLoggedIn');
    document.getElementById('adminSection').classList.add('d-none');
    document.getElementById('loginSection').classList.remove('d-none');
    // 清空输入框
    document.getElementById('adminUser').value = '';
    document.getElementById('adminPwd').value = '';
}

// 显示管理员后台区域
function showAdminSection() {
    document.getElementById('loginSection').classList.add('d-none');
    document.getElementById('adminSection').classList.remove('d-none');
    // 加载截止日期
    const deadline = localStorage.getItem('surveyDeadline');
    if (deadline) {
        document.getElementById('deadline').value = deadline;
    }
    // 加载调研状态
    const surveyStatus = localStorage.getItem('surveyStatus') !== 'false';
    document.getElementById('surveyStatus').checked = surveyStatus;
}

// 加载数据汇总
function loadDataSummary(filterDept = '', filterDuration = '') {
    const allSurveyData = JSON.parse(localStorage.getItem('allSurveyData')) || [];
    // 筛选数据
    let filteredData = allSurveyData;
    if (filterDept) {
        filteredData = filteredData.filter(item => item.dept === filterDept);
    }
    if (filterDuration) {
        filteredData = filteredData.filter(item => item.workDuration === filterDuration);
    }

    // 更新统计数
    document.getElementById('filledCount').textContent = filteredData.length;
    // 模拟未填写人数（实际需结合公司总人数）
    document.getElementById('unfilledCount').textContent = 100 - filteredData.length;

    // 统计满意度分布
    const satisfactionCount = {
        '非常满意': 0,
        '满意': 0,
        '一般': 0,
        '不满意': 0,
        '非常不满意': 0
    };
    filteredData.forEach(item => {
        if (satisfactionCount.hasOwnProperty(item.satisfaction1)) {
            satisfactionCount[item.satisfaction1]++;
        }
    });

    // 更新表格数据
    const total = filteredData.length;
    document.getElementById('count1').textContent = satisfactionCount['非常满意'];
    document.getElementById('rate1').textContent = total ? `${((satisfactionCount['非常满意'] / total) * 100).toFixed(1)}%` : '0%';
    document.getElementById('count2').textContent = satisfactionCount['满意'];
    document.getElementById('rate2').textContent = total ? `${((satisfactionCount['满意'] / total) * 100).toFixed(1)}%` : '0%';
    document.getElementById('count3').textContent = satisfactionCount['一般'];
    document.getElementById('rate3').textContent = total ? `${((satisfactionCount['一般'] / total) * 100).toFixed(1)}%` : '0%';
    document.getElementById('count4').textContent = satisfactionCount['不满意'];
    document.getElementById('rate4').textContent = total ? `${((satisfactionCount['不满意'] / total) * 100).toFixed(1)}%` : '0%';
    document.getElementById('count5').textContent = satisfactionCount['非常不满意'];
    document.getElementById('rate5').textContent = total ? `${((satisfactionCount['非常不满意'] / total) * 100).toFixed(1)}%` : '0%';

    // 加载开放性建议
    const suggestionsList = document.getElementById('suggestionsList');
    if (filteredData.length === 0) {
        suggestionsList.innerHTML = '暂无数据';
        return;
    }
    let suggestionsHtml = '';
    filteredData.forEach((item, index) => {
        if (item.suggestion1 || item.suggestion2) {
            suggestionsHtml += `
                <div class="card mb-2">
                    <div class="card-header">填写记录 ${index + 1}</div>
                    <div class="card-body">
                        <p><strong>优化建议：</strong>${item.suggestion1 || '无'}</p>
                        <p><strong>其他反馈：</strong>${item.suggestion2 || '无'}</p>
                    </div>
                </div>
            `;
        }
    });
    suggestionsList.innerHTML = suggestionsHtml || '暂无开放性建议';
}

// 筛选数据
function filterData() {
    const dept = document.getElementById('filterDept').value;
    const duration = document.getElementById('filterDuration').value;
    loadDataSummary(dept, duration);
}

// 导出Excel汇总报表
function exportExcel() {
    const allSurveyData = JSON.parse(localStorage.getItem('allSurveyData')) || [];
    if (allSurveyData.length === 0) {
        alert('暂无数据可导出！');
        return;
    }

    // 构建Excel数据
    const headers = ['填写时间', '所在部门', '在岗时长', '排班频率满意度', '排班合理性', '优化建议', '其他反馈'];
    const data = [headers];
    allSurveyData.forEach(item => {
        data.push([
            item.submitTime || '',
            item.dept || '未填写',
            item.workDuration || '未填写',
            item.satisfaction1 || '',
            item.satisfaction2 || '',
            item.suggestion1 || '未填写',
            item.suggestion2 || '未填写'
        ]);
    });

    // 生成Excel文件
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '排班调研汇总数据');
    XLSX.writeFile(wb, `排班调研汇总报表_${new Date().toISOString().split('T')[0]}.xlsx`);

    alert('Excel汇总报表导出成功！');
}

// 保存调研设置
function saveSetting() {
    const surveyStatus = document.getElementById('surveyStatus').checked;
    const deadline = document.getElementById('deadline').value;

    localStorage.setItem('surveyStatus', surveyStatus);
    localStorage.setItem('surveyDeadline', deadline);

    alert('设置保存成功！');
}

// 修改问卷内容（模拟）
function editSurvey() {
    const surveyStatus = document.getElementById('surveyStatus').checked;
    if (surveyStatus) {
        alert('请先关闭调研入口后再修改问卷内容！');
        return;
    }
    alert('问卷编辑功能需结合后端开发，此处仅为模拟提示。');
}