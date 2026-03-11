// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 点击导出按钮打开弹窗
    document.getElementById('exportBtn').addEventListener('click', function() {
        const modal = new bootstrap.Modal(document.getElementById('exportModal'));
        modal.show();
    });

    // 确认导出
    document.getElementById('confirmExportBtn').addEventListener('click', exportRecord);
});

// 导出填写记录
function exportRecord() {
    const surveyData = JSON.parse(localStorage.getItem('surveyData'));
    if (!surveyData) {
        alert('暂无填写记录可导出！');
        return;
    }

    // 构建导出内容
    const exportContent = `
        <div style="padding: 20px; font-family: Arial, sans-serif;">
            <h2 style="text-align: center; margin-bottom: 30px;">匿名排班满意度调研填写记录</h2>
            <p style="text-align: right;">填写时间：${new Date().toLocaleString()}</p>
            
            <h4 style="margin-top: 20px;">一、基本信息（可选）</h4>
            <p>所在部门：${surveyData.dept || '未填写'}</p>
            <p>在岗时长：${surveyData.workDuration || '未填写'}</p>
            
            <h4 style="margin-top: 20px;">二、排班满意度核心问题</h4>
            <p>1. 您对当前排班频率的满意度：${surveyData.satisfaction1}</p>
            <p>2. 您认为当前排班是否合理：${surveyData.satisfaction2}</p>
            
            <h4 style="margin-top: 20px;">三、开放性问题</h4>
            <p>1. 您对当前排班有哪些具体的优化建议？</p>
            <p style="margin-left: 20px; white-space: pre-wrap;">${surveyData.suggestion1 || '未填写'}</p>
            <p>2. 您是否有其他想反馈的内容？</p>
            <p style="margin-left: 20px; white-space: pre-wrap;">${surveyData.suggestion2 || '未填写'}</p>
            
            <p style="margin-top: 30px; text-align: center; color: #666;">本记录仅包含填写答案，无任何个人身份信息</p>
        </div>
    `;

    // 获取导出格式
    const format = document.getElementById('exportFormat').value;
    // 生成文件名
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const fileName = `排班调研填写记录_${date}`;

    try {
        if (format === 'pdf') {
            // 导出PDF
            const opt = {
                margin: 10,
                filename: `${fileName}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            html2pdf().set(opt).from(exportContent).save();
        } else {
            // 导出Word（模拟，实际需后端支持）
            const blob = new Blob(['\ufeff', exportContent], { type: 'application/msword' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${fileName}.doc`;
            a.click();
            URL.revokeObjectURL(url);
        }
        // 关闭弹窗
        const modal = bootstrap.Modal.getInstance(document.getElementById('exportModal'));
        modal.hide();
        alert('导出成功！文件已保存至浏览器默认下载路径。');
    } catch (error) {
        alert('导出失败，请刷新页面重试，或联系管理员协助处理（联系电话：010-XXXXXXX）');
        console.error('导出失败：', error);
    }
}