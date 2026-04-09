chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'START_ORGANIZE') {
    organizeBookmarks(request.apiKey)
      .then(() => sendResponse({ success: true }))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true; // 保持消息通道打开，以支持异步响应
  }
});

async function organizeBookmarks(apiKey) {
  // 1. 获取所有书签并展平
  const tree = await chrome.bookmarks.getTree();
  const flatBookmarks = [];
  
  function flatten(nodes) {
    for (let node of nodes) {
      // 只提取有 URL 的真实书签，并且限制 title 长度以节省 Token
      if (node.url && !node.url.startsWith('chrome://') && !node.url.startsWith('edge://')) {
        flatBookmarks.push({
          id: node.id,
          t: node.title.substring(0, 80) // 提取前80个字符作为标题
        });
      }
      if (node.children) flatten(node.children);
    }
  }
  flatten(tree);

  if (flatBookmarks.length === 0) throw new Error("没有找到可整理的书签");

  // 防止书签太多导致超过大模型上下文限制，这里做一个硬截断（可选）
  // 如果你书签极其多，建议分批处理，目前这里最大支持一次发送大约 500 个书签
  const targetBookmarks = flatBookmarks.slice(0, 500);

  // 2. 构造 DeepSeek 的 Prompt
  const prompt = `你是一个专业的浏览器书签整理助手。请分析以下网页标题，将它们进行语义聚类，归纳出 5 到 10 个最合适的单层分类（例如：开发编程、AI工具、娱乐影视、学术研究等）。

请必须且只能返回一个合法的 JSON 对象（不要带有markdown代码块格式，直接输出纯JSON），结构必须严格遵守如下格式：
{
  "categories": ["分类1", "分类2"],
  "mapping": [
    {"id": "书签的id", "category": "分类1"}
  ]
}

待整理的书签列表数据：
${JSON.stringify(targetBookmarks)}`;

  // 3. 调用 DeepSeek API
  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: "You are a helpful assistant designed to output strict JSON." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1 // 降低随机性，保证分类更稳健
    })
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.error?.message || "API 调用失败");
  }

  const data = await response.json();
  let result;
  try {
    result = JSON.parse(data.choices[0].message.content);
  } catch (e) {
    throw new Error("大模型返回的数据不是合法 JSON，解析失败");
  }

  if (!result.categories || !result.mapping) {
    throw new Error("大模型返回的数据缺少 categories 或 mapping 字段");
  }

  // 4. 重组书签树
  // 建立一个安全舱：统一放入 "🌟 AI 整理归档" 文件夹
  const parentFolder = await chrome.bookmarks.create({ title: "🌟 AI 整理归档" });

  // 创建子分类文件夹
  const categoryFolderIds = {};
  for (let cat of result.categories) {
    const folder = await chrome.bookmarks.create({ parentId: parentFolder.id, title: cat });
    categoryFolderIds[cat] = folder.id;
  }

  // 移动书签到对应的分类文件夹
  for (let item of result.mapping) {
    const targetFolderId = categoryFolderIds[item.category];
    if (targetFolderId) {
      try {
        await chrome.bookmarks.move(item.id, { parentId: targetFolderId });
      } catch (moveErr) {
        console.warn(`书签 ID ${item.id} 移动失败:`, moveErr);
      }
    }
  }
}