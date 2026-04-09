document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('apiKey');
  const saveBtn = document.getElementById('saveBtn');
  const backupBtn = document.getElementById('backupBtn');
  const organizeBtn = document.getElementById('organizeBtn');
  const statusDiv = document.getElementById('status');

  // 初始化加载保存的 API Key
  chrome.storage.local.get(['deepseekApiKey'], (result) => {
    if (result.deepseekApiKey) {
      apiKeyInput.value = result.deepseekApiKey;
    }
  });

  // 保存 API Key
  saveBtn.addEventListener('click', () => {
    const key = apiKeyInput.value.trim();
    if (key) {
      chrome.storage.local.set({ deepseekApiKey: key }, () => {
        showStatus('API Key 保存成功！', '#4CAF50');
      });
    } else {
      showStatus('请输入有效的 API Key');
    }
  });

  // 备份书签
  backupBtn.addEventListener('click', () => {
    chrome.bookmarks.getTree((tree) => {
      const blob = new Blob([JSON.stringify(tree, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      chrome.downloads.download({
        url: url,
        filename: `bookmarks_backup_${new Date().getTime()}.json`,
        saveAs: true
      });
      showStatus('备份文件已生成！', '#4CAF50');
    });
  });

  // 触发整理
  organizeBtn.addEventListener('click', () => {
    chrome.storage.local.get(['deepseekApiKey'], (result) => {
      if (!result.deepseekApiKey) {
        showStatus('请先输入并保存 API Key！');
        return;
      }
      showStatus('🧠 AI 正在疯狂思考中，请稍候...', '#0078D7');
      organizeBtn.disabled = true;
      
      // 发送消息给后台脚本执行核心逻辑
      chrome.runtime.sendMessage({ action: 'START_ORGANIZE', apiKey: result.deepseekApiKey }, (response) => {
        organizeBtn.disabled = false;
        if (response && response.success) {
          showStatus('✅ 整理完成！请查看书签栏的"🌟 AI 整理归档"', '#4CAF50');
        } else {
          showStatus(`❌ 出错了: ${response.error}`);
        }
      });
    });
  });

  function showStatus(text, color = '#d93025') {
    statusDiv.textContent = text;
    statusDiv.style.color = color;
  }
});