// public/system.js

let systemContent = ''; // 全局变量来存储system的内容

async function updateSystemRole() {
    const systemInput = document.getElementById('systemInput');
    if (systemInput.value) {
        const response = await fetch('/api/system', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ systemContent: systemInput.value })
        });

        const result = await response.json();
        if (response.ok) {
            alert('System role content updated!');
        } else {
            alert('Error: ' + result.message);
        }
    } else {
        alert('Please enter the system role content.');
    }

    // 更新全局变量
    systemContent = systemInput.value;
}

