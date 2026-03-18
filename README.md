<div align="center">

# 📦 LLM Web Context Bridge

**Browser extension to generate project context prompts for LLMs**

[![Chrome](https://img.shields.io/badge/Chrome-114%2B-green?logo=google-chrome&logoColor=white)](https://www.google.com/chrome/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

[English](#english) | [中文](#中文)

</div>

---

<a name="english"></a>
## English

### Overview

A Chrome extension that generates structured project context prompts for Large Language Models (LLMs). Simply select your project folder, pick the files/folders you want to include, and generate a well-formatted prompt with project structure and file contents.

### ✨ Features

- 🎯 **Side Panel UI** - Clean interface in Chrome's side panel, won't interfere with your browsing
- 📁 **Smart File Tree** - Hierarchical display with expand/collapse, checkbox selection with parent-child sync
- 🔄 **Real-time Sync** - Refresh button to sync local file changes instantly
- 📋 **One-Click Copy** - Copy file content with formatted markers, or generate full project structure
- 🌐 **Bilingual Support** - Switch between English and Chinese interfaces
- 🔒 **100% Offline** - All processing happens locally in your browser, your code never leaves your machine
- ✏️ **Editable Prompts** - Generated prompts can be manually edited before use

### 📦 Installation

#### From Source

1. Clone this repository
   ```bash
   git clone https://github.com/your-username/llm-web-context-bridge.git
   cd llm-web-context-bridge
   ```

2. Install dependencies
   ```bash
   pnpm install
   ```

3. Build the extension
   ```bash
   pnpm run build:extension
   ```

4. Load in Chrome
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (top right toggle)
   - Click "Load unpacked"
   - Select the `dist` folder from this project

### 🚀 Usage

1. **Open Side Panel**
   - Click the extension icon in Chrome toolbar
   - Or use keyboard shortcut (configurable at `chrome://extensions/shortcuts`)

2. **Select Project**
   - Click "📁 Select Folder" button
   - Choose your project directory in the dialog

3. **Select Files/Folders**
   - Check files or folders to include in the prompt
   - Checking a folder automatically checks all its children
   - Checking a child automatically checks its parent folders

4. **Copy File Content** (Optional)
   - Click "📋 Copy Content" button next to any file
   - File content will be copied to clipboard with formatted markers:
   ```
   =======filename-start========
   file content here
   =======filename-end==========
   ```

5. **Generate Structure**
   - Click "📝 Generate" button
   - Only selected files/folders will be included in the structure

6. **Edit & Copy**
   - The prompt is editable - modify as needed
   - Click "📋 Copy" in the top right to copy the entire prompt

### 📋 Generated Prompt Format

```
## Project Structure
```
└── ☑ src/
    ├── ☑ components/
    │   └── ☑ Button.tsx
    └── ☑ utils/
        └── ☑ helpers.ts
```

## Task
{Your task here}
```

### 🛠️ Tech Stack

- **Chrome Extension Manifest V3** - Latest extension standard
- **Side Panel API** - Native Chrome side panel
- **File System Access API** - Secure local file access
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool

### 📁 Project Structure

```
├── src/
│   ├── manifest.json          # Extension configuration
│   ├── sidepanel.html         # Side panel page
│   ├── sidepanel.ts           # Main logic
│   ├── sidepanel.css          # Styles
│   ├── background/
│   │   └── index.ts           # Service worker
│   ├── core/
│   │   ├── fileScanner.ts     # Directory scanning
│   │   ├── contentLoader.ts   # File content loading
│   │   └── index.ts           # Module exports
│   └── types/
│       └── filesystem.d.ts    # Type definitions
├── public/
│   └── icons/                 # Extension icons
├── scripts/
│   ├── build-extension.js     # Build configuration
│   └── generate-icons.js      # Icon generator
└── dist/                      # Build output
```

### 🔧 Development

```bash
# Type check
pnpm run ts-check

# Build extension
pnpm run build:extension

# Development mode (watch for changes)
pnpm run dev
```

### ⚠️ Notes

- **Browser Support**: Chrome 114+ (required for Side Panel API)
- **File Size Limit**: Single file content limited to 100KB
- **Privacy**: No data is ever sent to any server, all processing is local
- **Permissions**:
  - `sidePanel`: Display side panel
  - `storage`: Save language preference

---

<a name="中文"></a>
## 中文

### 概述

一款为大型语言模型（LLM）生成项目上下文提示词的 Chrome 扩展。只需选择项目文件夹，勾选需要包含的文件/文件夹，即可生成格式规范的项目结构和文件内容提示词。

### ✨ 功能特性

- 🎯 **侧边栏界面** - 使用 Chrome 原生侧边栏，不影响正常浏览
- 📁 **智能文件树** - 层级展示，支持展开折叠，勾选时父子联动
- 🔄 **实时同步** - 刷新按钮可即时同步本地文件变更
- 📋 **一键复制** - 可复制单个文件内容（带格式标记），或生成完整项目结构
- 🌐 **双语支持** - 中英文界面一键切换
- 🔒 **完全离线** - 所有处理均在本地完成，代码不会离开您的设备
- ✏️ **可编辑** - 生成的提示词支持手动修改

### 📦 安装

#### 从源码安装

1. 克隆仓库
   ```bash
   git clone https://github.com/your-username/llm-web-context-bridge.git
   cd llm-web-context-bridge
   ```

2. 安装依赖
   ```bash
   pnpm install
   ```

3. 构建扩展
   ```bash
   pnpm run build:extension
   ```

4. 在 Chrome 中加载
   - 打开 Chrome，访问 `chrome://extensions/`
   - 开启右上角「开发者模式」
   - 点击「加载已解压的扩展程序」
   - 选择项目的 `dist` 目录

### 🚀 使用方法

1. **打开侧边栏**
   - 点击浏览器工具栏中的扩展图标
   - 或使用快捷键（可在 `chrome://extensions/shortcuts` 设置）

2. **选择项目**
   - 点击「📁 选择文件夹」按钮
   - 在对话框中选择项目目录

3. **勾选文件/文件夹**
   - 勾选需要包含的文件或文件夹
   - 勾选文件夹会自动勾选所有子项
   - 勾选子项会自动勾选父文件夹

4. **复制文件内容**（可选）
   - 点击文件旁的「📋 复制内容」按钮
   - 文件内容将被复制到剪贴板，格式如下：
   ```
   =======filename-start========
   文件内容
   =======filename-end==========
   ```

5. **生成目录结构**
   - 点击「📝 生成目录」按钮
   - 只有勾选的文件/文件夹会被包含

6. **编辑和复制**
   - 提示词支持手动编辑
   - 点击右上角「📋 复制」复制完整提示词

### 默认忽略

以下目录会被自动忽略：
- `node_modules`, `.git`, `dist`, `build`
- `.next`, `out`, `.cache`, `__pycache__`
- `.DS_Store`, `Thumbs.db`

以下文件扩展名会被忽略：
- `.lock`, `.log`, `.bak`, `.swp`, `.swo`

### 🔧 开发

```bash
# 类型检查
pnpm run ts-check

# 构建扩展
pnpm run build:extension

# 开发模式（监听文件变化）
pnpm run dev
```

### ⚠️ 注意事项

- **浏览器支持**：Chrome 114+（需要 Side Panel API）
- **文件大小限制**：单文件内容限制 100KB
- **隐私保护**：数据完全在本地处理，不上传任何服务器
- **权限说明**：
  - `sidePanel`：显示侧边栏
  - `storage`：保存语言设置

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Made with ❤️ for developers using LLMs**

If this project helps you, please consider giving it a ⭐️

</div>
