# 🌟 AI Bookmark Organizer (AI 书签整理大师 - DeepSeek 版)

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Browser](https://img.shields.io/badge/browser-Edge%20%7C%20Chrome-orange.svg)
![Model](https://img.shields.io/badge/AI_Model-DeepSeek_V3-blueviolet.svg)

一个轻量级的纯前端浏览器插件，利用 **DeepSeek** 大模型的强大语义理解能力，一键将你浏览器中杂乱无章的书签进行自动聚类、重命名和归类整理。

告别手动拖拽，让 AI 拯救你的收藏夹！

## ✨ 核心特性

- **🧠 智能语义聚类**：突破传统的关键词匹配，通过大模型真正理解网页标题含义，自动生成 5-10 个最贴合你当前收藏习惯的单层分类（如：AI开发、前端框架、效率工具、学术资料等）。
- **🛡️ 绝对安全机制 (Safe Archive)**：担心 AI 分类出错把原本的书签弄乱？本插件采用“安全舱”设计，所有整理后的书签会统一放入新建的 `🌟 AI 整理归档` 主文件夹中，**绝不破坏你原有的书签目录树**。
- **🔒 隐私优先**：纯前端架构，无需经过第三方后端服务器转发。通过直接调用 DeepSeek 官方 API，你的书签数据只在你本地电脑和 DeepSeek 之间传输。
- **💾 一键本地备份**：内置书签备份功能，强制在整理前生成 JSON 格式的书签备份文件，给你吃下定心丸。

## 🚀 安装指南

由于目前未上架扩展商店，请通过“开发者模式”本地加载：

1. 克隆或下载本仓库代码到本地文件夹。
2. 在 Edge 浏览器的地址栏输入 `edge://extensions/` 并回车。
3. 在页面的左侧边栏（或者页面某个角落），找到并开启**“开发人员模式”** (Developer mode) 的开关。
4. 点击出现的 **“加载解压缩的扩展”** (Load unpacked) 按钮，选中你刚才新建的那个文件夹。
5. 去 DeepSeek 开放平台（platform.deepseek.com）申请一个 API Key。
6. 点击浏览器右上角新出现的插件图标，填入 API Key -> 点击保存 -> **点击备份（一定要点！）** -> 点击一键智能分类！



