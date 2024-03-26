// server.js

const express = require('express');
const axios = require('axios');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static('public'));
app.use(morgan('dev'));

const GPT_API_KEY = process.env.GPT_API_KEY;
const GPT_API_URL = 'https://openai.api2d.net/v1/chat/completions';

// 添加新的路由来获取智谱token
const generateToken = (apikey) => {
    const [id, secret] = apikey.split(".");
    const payload = {
        "api_key": id,
        "exp": Math.floor(Date.now() / 1000) + (60 * 60), // Token 有效期1小时
        "timestamp": Math.floor(Date.now() / 1000)
    };

    return jwt.sign(payload, secret, {
        algorithm: "HS256",
        header: {
            "alg": "HS256",
            "sign_type": "SIGN"
        }
    });
};


// 添加新的路由来获取wenxin access_token
app.post('/api/wenxin-token', async (req, res) => {
    //console.log('Received request for Wenxin token'); // 打印请求接收日志
    try {
        const apiKey = process.env.WENXIN_API_KEY;
        const secretKey = process.env.WENXIN_SECRET_KEY;
        console.log('Requesting Wenxin token...'); // 打印正在请求token的日志
        const tokenResponse = await axios.get(`https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${apiKey}&client_secret=${secretKey}`);

        //console.log('Wenxin token response:', tokenResponse.data); // 打印token响应
        res.send(tokenResponse.data);
    } catch (error) {
        console.error('Error while getting token:', error);
        res.status(500).send('Error while getting Wenxin token');
        console.log('Failed to get Wenxin token'); // 打印获取token失败的日志
    }
});



let gptConversationHistory = [{
    role: "system",
    content: process.env.WENXIN_SYSTEM_CONTENT
}];

let zhipuConversationHistory = [{
    role: "system",
    content: process.env.WENXIN_SYSTEM_CONTENT
}];

let wenxinConversationHistory = [{
    role: "system",
    content: "记住，你是我的个人助理小小"
}];

let gptUserConversationHistory = [];
let zhipuUserConversationHistory = [];
let wenxinUserConversationHistory = [];

// 清空聊天记录的路由
app.post('/api/clear-history', (req, res) => {
    gptConversationHistory = [{ role: "system", content: process.env.WENXIN_SYSTEM_CONTENT }];
    zhipuConversationHistory = [{ role: "system", content: process.env.WENXIN_SYSTEM_CONTENT }];
    wenxinConversationHistory = [{ role: "system", content: "你是我的助理小小。" }];

    gptUserConversationHistory = [];
    zhipuUserConversationHistory = [];
    wenxinUserConversationHistory = []; // 确保清空文心用户对话历史

    res.send({ message: 'Chat history cleared successfully.' });
});


app.get('/system', (req, res) => {
    res.sendFile(__dirname + '/public/system.html');
});

// 更新系统角色内容的路由
app.post('/api/system', (req, res) => {
    try {
        const newSystemContent = req.body.systemContent;
        // 更新GPT和智谱的系统角色内容
        gptConversationHistory[0] = { role: "system", content: newSystemContent };
        zhipuConversationHistory[0] = { role: "system", content: newSystemContent };

        res.send({ message: 'System role content updated successfully.' });
    } catch (error) {
        console.error('Error details:', error);
        res.status(500).send({ message: 'Error updating system role content.' });
    }
});


// GPT聊天接口
app.post('/api/chat', async (req, res) => {

    const model = req.body.model || "gpt-3.5-turbo"; // 默认使用 gpt-3.5-turbo

    try {
        const userMessage = { role: "user", content: req.body.prompt };
        gptConversationHistory.push(userMessage);

        const response = await axios.post(
            GPT_API_URL,
            {
                model: model,
                messages: gptConversationHistory,
                stream: false
            },
            {
                headers: {
                    'Authorization': `Bearer ${GPT_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const gptResponse = response.data.choices[0].message;
        let gptResponseContent = typeof gptResponse.content === 'object' ?
            JSON.stringify(gptResponse.content) :
            gptResponse.content;

        const gptMessageForUser = { role: "gpt", content: gptResponseContent };
        
        // 记录用户消息
        gptUserConversationHistory.push(userMessage);

        // 更新GPT对话历史
        gptUserConversationHistory.push(gptMessageForUser);

        // 打印GPT对话历史
        console.log('GPT Conversation History:', gptUserConversationHistory);

        // 返回GPT的聊天历史
        res.send(gptUserConversationHistory);

    } catch (error) {
        console.error('Error details:', error.response ? error.response.data : error);
        res.status(500).send('Error while communicating with GPT API');
    }
});

// 智谱AI聊天接口
app.post('/api/zhipu-chat', async (req, res) => {

    const model = req.body.model || "glm-3-turbo"; // 默认使用 glm-3-turbo

    try {
        const userMessage = { role: "user", content: req.body.prompt };
        zhipuConversationHistory.push(userMessage);

        const token = generateToken(process.env.ZHIPU_API_KEY);
        const response = await axios.post('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
            model: model,
            messages: zhipuConversationHistory,
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const zhipuResponse = response.data.choices[0].message;
        const zhipuResponseContent = zhipuResponse.content;

        const zhipuMessageForUser = {
            role: "zhipu",
            content: zhipuResponseContent
        };

        // 记录用户消息
        zhipuUserConversationHistory.push(userMessage);
        
        // 更新智谱对话历史
        zhipuUserConversationHistory.push(zhipuMessageForUser);

        // 打印智谱对话历史
        console.log('Zhipu Conversation History:', zhipuUserConversationHistory);

        // 返回智谱的聊天历史
        res.send(zhipuUserConversationHistory);

    } catch (error) {
        console.error('Error: ', error);
        res.status(500).send('Error while communicating with Zhipu AI');
    }
});

// 文心AI聊天接口
app.post('/api/wenxin-chat', async (req, res) => {
    try {
        const accessToken = req.body.accessToken;  // 从请求体中获取 access_token
        const messages = req.body.messages;        // 从请求体中获取对话消息
        const systemContent = process.env.WENXIN_SYSTEM_CONTENT; // 从环境变量中获取系统内容

        // 直接使用提供的消息进行请求，不再添加系统内容
        const chatResponse = await axios.post(`https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions_pro?access_token=${accessToken}`, {
            messages: messages, // 使用请求中传递的对话历史
            system: systemContent,
        }, {
            headers: { 'Content-Type': 'application/json' }
        });

        console.log("Wenxin API Response:", chatResponse.data);

        // 提取文心一言的回应并更新历史记录
        const wenxinResponse = {
            role: "wenxin",
            content: chatResponse.data.result
        };
        // 不再添加系统角色到对话历史
        wenxinUserConversationHistory.push(...messages, wenxinResponse);

        // 打印文心一言对话历史
        console.log('Wenxin Conversation History:', wenxinUserConversationHistory);

        // 返回文心一言的聊天历史
        res.send(wenxinUserConversationHistory);
    } catch (error) {
        console.error('Error while communicating with Wenxin Chat:', error);
        res.status(500).send('Error while communicating with Wenxin Chat');
    }
});

// glm4v
/* async function fetchResponse() {
    const url = "https://open.bigmodel.cn/api/paas/v4/chat/completions"; // 替换为相应的API URL
    const token = generateToken(process.env.ZHIPU_API_KEY);
    const data = {
        model: "glm-4v", // 填写需要调用的模型名称
        messages: [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "这是一个视力检查单数据，帮我把里面的指标提取出来，并用json文件输出返回。如果遇到没有内容的字段就返回--。要仔细区分一个内容是字段还是数据。"
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": "https://cc-1252288917.cos.ap-beijing.myqcloud.com/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20240119151956.jpg"
                        }
                    }
                ]
            }
        ]
    };

    try {
        const response = await axios.post(url, data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        console.log(response.data.choices[0].message);
    } catch (error) {
        console.error('Error fetching response:', error);
    }
}

fetchResponse(); */



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
