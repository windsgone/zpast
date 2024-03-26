const WebSocket = require('ws');

let messageBuffer = [];

const crypto = require('crypto');
const querystring = require('querystring');

// 假定的 APIKey 和 APISecret
const APIKey = '9c746e91d8c0d7ff9971e237843bb173';
const APISecret = 'Y2QwNTgxNTA1ZjIwYjQ5ZTlmNjc0M2Fi';

// 获取当前时间戳（RFC1123 格式）
const date = new Date().toUTCString();

// 构建待签名的字符串
const signString = `host: spark-api.xf-yun.com\n` +
                   `date: ${date}\n` +
                   `GET /v3.1/chat HTTP/1.1`;

// 使用 HMAC-SHA256 算法进行签名
const signature = crypto.createHmac('sha256', APISecret)
                       .update(signString)
                       .digest('base64');

// 构建 authorization 字符串
const authorizationOrigin = `api_key="${APIKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;

// 对 authorization 字符串进行 Base64 编码
const authorization = Buffer.from(authorizationOrigin).toString('base64');

// 构建最终的 URL
const urlParams = {
    authorization: authorization,
    date: date,
    host: 'spark-api.xf-yun.com'
};
const finalUrl = `wss://spark-api.xf-yun.com/v3.1/chat?${querystring.stringify(urlParams)}`;

console.log(finalUrl);


// 构建 WebSocket 连接
const ws = new WebSocket(finalUrl);

ws.on('open', function open() {
  // 构建请求数据
  const requestData = {
    header: {
      app_id: 'd87b3130',
    },
    parameter: {
      chat: {
        domain: 'generalv3',
        temperature: 0.5,
        // max_tokens: 1024
      }
    },
    payload: {
      message: {
        text: [
          { role: "user", content: "## Role: 招聘专家\n\n### Profile:\n- Language: 中文\n- Description: 此角色是一位在撰写职位描述方面具有丰富经验的招聘专家。他或她能够准确理解业务方提供的用户画像，根据这些信息定制和优化职位描述，以吸引合适的候选人。\n\n### Skill:\n1. 深刻理解不同业务领域的用户画像。\n2. 能够将用户画像转化为具体的职位要求。\n3. 熟悉各种行业的职位描述和要求。\n4. 出色的沟通和写作能力，能够清晰表达职位信息。\n5. 精通职位描述的市场趋势和最佳实践。\n\n### Goals:\n1. 准确理解业务方提供的用户画像。\n2. 根据用户画像撰写符合要求的职位描述。\n3. 确保职位描述吸引合适的候选人。\n4. 优化职位描述以提高应聘者的质量。\n5. 不断更新职位描述，以匹配市场和行业的变化。\n\n### Constrains:\n1. 必须基于业务方提供的准确用户画像\n2. 业务方提出的需求必须体现在JD中\n3. 遵循行业标准和最佳实践。\n4. 保持职位描述的简洁和专业性。\n5. 遵守相关的法律和伦理标准。\n6. 输出的JD必须包含一、岗位描述；二、职位要求；三、行业经验；四、专业能力；五、语言要求五个部分，缺一不可\n\n### examples:\n#### 示例一\n岗位名称：\n'''\n高级前端工程师\n'''\n业务方提供的用户画像：\n'''\n要求统招本科学历，3年以上工作经验。技术栈要求会react，稳定性好一些，有招聘公司相关经验优先。\n'''\n招聘专家给出的职位JD：\n'''\n一、岗位描述\n1. 参与前端框架建设、核心功能的技术选型、预研和架构设计；\n2. 负责前端核心功能和代码的开发、技术难点的攻关；\n3. 与后端工程师深度交流合作，参与设计前后端的数据交互规范；\n4. 对前端代码质量及进度负责，Review成员代码；\n5. 参与优化产品交互和性能，提升更好的用户体验和响应速度，保持在各浏览器下的良好兼容性；\n6. 参与开发流程讨论和优化。\n二、职位要求\n1. 学历背景：统招本科及以上学历，信息技术相关专业；\n2. 工作经验：5年以上Web开发经验。\n三、行业经验：\n1. 有独立负责模块的设计和研发经验；\n2. 参与过大型项目建设。\n四、专业能力：\n1. 精通前端技术；\n2. 熟练使用各种常见框架；\n3. 对优化站点有一定的心得体会，具备较强的学习实践能力，能主动探索新知识的应用，能够顺畅的理解开发需求，对项目整体开发有预见性；\n4. 能指导初中级Web工程师进行模块化的开发；\n5. 具备一定问题排查能力。\n五、语言要求\n1. 通畅专业的文字及语言沟通表达能力。\n'''\n#### 示例二\n岗位名称：\n'''\n高级Java工程师\n'''\n业务方提供的用户画像：\n'''\n要求统招本科学历，5年以上工作经验。技术栈要求：springcloud，redis，sql，稳定性好一些.\n'''\n招聘专家给出的职位JD：\n'''\n一、岗位描述\n1. 参与系统整体的功能分析、概要设计、数据设计，技术方案的讨论和决策；\n2. 独立完成系统模块的分析、设计，并可以带1人以上初、中级人员开发；\n3. 能够独立进行系统核心部分代码的实现、及疑难题目的定位、解决；\n4. 制定技术文档和开发规范，并对开发过程进行持续改进，编写相应的概要设计文档、部署文档等技术文档。\n二、职位要求：\n1. 学历背景：本科及以上学历，信息技术相关专业；\n2. 工作经验：5年以上Java开发经验。\n三、行业经验：\n1. 有独立负责模块的设计和研发经验；\n2. 参与过大型项目建设。\n四、专业能力：\n1. 精通Java语言，理解高并发，多线程，JVM、操作系统等；\n2. 熟练掌握常用的数据结构、设计模式、分布式、微服务系统设计理论、服务治理方法等；\n3. 熟悉MySQL、NoSQL、rabbitmq等，掌握分布式Session、分布式缓存、一致性、负载均衡等；\n4. 能指导初中级Java进行模块化的开发；\n5. 具备一定问题排查能力。\n五、语言要求\n1. 通畅专业的文字及语言沟通表达能力。\n'''\n#### 示例三\n岗位名称：\n'''\n产品专家\n'''\n业务方提供的用户画像：\n'''\n要求统招本科学历，5年以上工作经验，稳定性好一些，有b端招聘行业产品经验，对比公司moka，北森等\n'''\n招聘专家给出的职位JD：\n'''\n一、岗位描述\n1. 负责对招聘管理模块需求进行分析挖掘，对同行业产品进行竞品分析；\n2. 负责产品功能、逻辑、交互的定义（MRD/PRD），按产品设计文档规范，编写产品需求文档，包含业务结构及流程、界面原型和交互设计等；\n3. 实现规范的版本管理，维护产品的每个版本的功能列表；\n4. 组织协调研发等相关部门，对需求进行评估及确认开发周期，跟踪项目进度，配合完成产品UAT验证工作，确保版本质量；\n5. 制定产品培训课程，为公司相关部门提供专业产品培训、产品演示。\n二、职位要求：\n1. 学历背景：本科及以上学历，信息技术相关专业；\n2. 工作经验：5年以上互联网产品工作经验。\n三、行业经验：\n1. 有B端产品经验；\n2. 有招聘管理、Moka等三方管理招聘平台经验优先；\n3. 有参与到一个产品模块的经验，包括完成市场调研、产品整体设计，并针对中期发展进行产品规划，目标制定与具体执行；\n4. 逻辑性强、沟通能力强。\n'''" },
          { role: "assistant", content: "'''岗位名称：数据分析师\n\n业务方提供的用户画像：要求统招本科学历，3年以上工作经验。技术栈要求会SQL，Python，R等数据分析工具，稳定性好一些，有招聘行业经验优先。\n\n招聘专家给出的职位JD：一、岗位描述\n\n负责日常数据分析工作，包括数据提取、清洗、整理和分析；根据业务需求进行数据建模和预测分析；对业务数据进行深入挖掘，为业务决策提供数据支持；编写数据分析报告，及时向团队和管理层汇报分析结果；跟踪分析结果的执行效果，持续优化分析方法和模型。\n\n二、职位要求：\n\n学历背景：本科及以上学历，信息技术相关专业；工作经验：3年以上数据分析工作经验。\n\n三、行业经验：\n\n有招聘行业数据分析经验优先；熟悉招聘行业的业务流程和关键指标。\n\n四、专业能力：\n\n熟练掌握SQL，Python，R等数据分析工具；具备良好的数据敏感度，能够从海量数据中发现问题和机会；熟悉常用的数据分析方法和模型；具备较强的逻辑思维能力和报告撰写能力。\n\n五、语言要求：\n\n通畅专业的文字及语言沟通表达能力.'''"},
          { role: "user", content: "再帮我写份UX专家的JD"}
        ]
      }
    }
  };

  // 发送请求数据
  ws.send(JSON.stringify(requestData));
});

ws.on('message', function incoming(data) {
    // 将接收到的数据片段添加到缓冲区
    messageBuffer.push(data);
  
    // 将数据片段合并为字符串
    const completeData = Buffer.concat(messageBuffer).toString();
  
    // 检查是否为消息的结束
    if (completeData.endsWith('}') || completeData.includes('status')) {
      // 清空缓冲区以备下一条消息
      messageBuffer = [];
  
      // 处理完整的消息
      console.log(completeData);
    }
  });


ws.on('error', function error(error) {
  // 处理错误情况
  console.error('WebSocket error:', error);
});