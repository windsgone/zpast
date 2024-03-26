// public/script.js

async function sendQuestion() {

    const userInput = document.getElementById('userInput');
    const gptModel = document.getElementById('gptModelSelect').value;
    const zhipuModel = document.getElementById('zhipuModelSelect').value;

    if (userInput.value) {
        // 向GPT发送问题并获取回复
        const gptResponse = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: userInput.value, model: gptModel })
        });

        const gptConversationHistory = await gptResponse.json();
        updateChatBox(gptConversationHistory, 'gpt');

        // 向智谱发送问题并获取回复
        const zhipuResponse = await fetch('/api/zhipu-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: userInput.value, model: zhipuModel })
        });

        const zhipuConversationHistory = await zhipuResponse.json();
        updateChatBox(zhipuConversationHistory, 'zhipu');


        // 获取文心API的令牌
        const tokenResponse = await fetch('/api/wenxin-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const tokenData = await tokenResponse.json();
        const wenxinToken = tokenData.access_token;

        // 使用获取的令牌向文心发送问题并获取回复

        console.log('Sending request to wenxin-chat API...');

        const wenxinResponse = await fetch('/api/wenxin-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                accessToken: wenxinToken,
                messages: [{ role: "user", content: userInput.value }] ,
            })
        });

        const wenxinConversationHistory = await wenxinResponse.json();
        updateChatBox(wenxinConversationHistory, 'wenxin');

        userInput.value = ''; // 清空输入框
    }
}

function updateChatBox(conversationHistory, chatBoxId) {
    let chatBox;
    if (chatBoxId === 'gpt') {
        chatBox = document.getElementById('gptChatBox');
    } else if (chatBoxId === 'zhipu') {
        chatBox = document.getElementById('zhipuChatBox');
    } else if (chatBoxId === 'wenxin') {
        chatBox = document.getElementById('wenxinChatBox');
    } else {
        return; // 如果chatBoxId不是'gpt'、'zhipu'或'wenxin'，则不执行任何操作
    }

    // 清空相应聊天框中的当前内容
    chatBox.innerHTML = '';

    conversationHistory.forEach(msg => {
        let sender;
        if (msg.role === 'user') {
            sender = 'You';
        } else if (msg.role === 'gpt') {
            sender = 'GPT';
        } else if (msg.role === 'zhipu') {
            sender = 'Zhipu';
        } else if (msg.role === 'wenxin') {
            sender = 'Wenxin';
        }
        appendMessage(sender, msg.content, chatBoxId);
    });
}


function appendMessage(sender, message, chatBoxId) {
    let chatBox;
    if (chatBoxId === 'gpt') {
        chatBox = document.getElementById('gptChatBox');
    } else if (chatBoxId === 'zhipu') {
        chatBox = document.getElementById('zhipuChatBox');
    } else if (chatBoxId === 'wenxin') {
        chatBox = document.getElementById('wenxinChatBox');
    } else {
        return; // 如果chatBoxId不是'gpt'或'zhipu'，则不执行任何操作
    }

    const messageElem = document.createElement('div');
    messageElem.textContent = `${sender}: ${message}`;
    chatBox.appendChild(messageElem);
}

window.onload = async function() {
    await fetch('/api/clear-history', { method: 'POST' });
    document.styleSheets[0].insertRule('.user-message { text-align: right; }', 0);
    document.styleSheets[0].insertRule('.assistant-message { text-align: left; }', 0);
    // 可以在这里添加其他初始化逻辑
};
