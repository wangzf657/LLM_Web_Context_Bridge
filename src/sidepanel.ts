// Sidepanel 主逻辑
import './sidepanel.css';

import {
  scanDirectory,
  flattenFiles,
  loadFileContent,
  formatSize
} from './core/index';

import type { FileNode } from './core/fileScanner';

// 国际化文本
const i18n = {
  zh: {
    headerTitle: '📦 项目上下文',
    selectFolder: '选择文件夹',
    refresh: '刷新',
    emptyText: '请选择一个项目文件夹',
    selectedCount: '已选: {count}',
    totalSize: '大小: {size}',
    generateText: '生成目录',
    promptTitle: 'Prompt:',
    copyContent: '复制内容',
    helpTitle: '🔒 安全说明',
    helpText: `本项目全程离线运行，所有数据仅在您的本地浏览器中处理。

✅ 不会上传任何数据到服务器
✅ 不会收集任何用户信息
✅ 所有文件处理均在本地完成

您的代码和数据完全安全！`,
    noSelection: '请先选择文件或文件夹',
    generateSuccess: '已生成目录结构',
    copySuccess: '已复制到剪贴板',
    copyFailed: '复制失败',
    loadFailed: '加载文件失败',
    fileTooLarge: '文件过大 ({size} > 100KB)',
    promptPlaceholder: '点击生成按钮或手动编辑...',
    copyPrompt: '复制',
    clear: '清空',
    refreshing: '刷新中...'
  },
  en: {
    headerTitle: '📦 Project Context',
    selectFolder: 'Select Folder',
    refresh: 'Refresh',
    emptyText: 'Please select a project folder',
    selectedCount: 'Selected: {count}',
    totalSize: 'Size: {size}',
    generateText: 'Generate',
    promptTitle: 'Prompt:',
    copyContent: 'Copy Content',
    helpTitle: '🔒 Security Notice',
    helpText: `This project runs entirely offline. All data is processed locally in your browser.

✅ No data is uploaded to any server
✅ No user information is collected
✅ All file processing is done locally

Your code and data are completely safe!`,
    noSelection: 'Please select files or folders first',
    generateSuccess: 'Structure generated',
    copySuccess: 'Copied to clipboard',
    copyFailed: 'Copy failed',
    loadFailed: 'Failed to load file',
    fileTooLarge: 'File too large ({size} > 100KB)',
    promptPlaceholder: 'Click generate button or edit manually...',
    copyPrompt: 'Copy',
    clear: 'Clear',
    refreshing: 'Refreshing...'
  }
};

// 状态管理
interface AppState {
  rootHandle: FileSystemDirectoryHandle | null;
  treeStructure: FileNode[];
  selectedItems: Set<string>; // 选中的项目路径（包括文件和文件夹）
  allFiles: FileNode[];
  allNodes: FileNode[]; // 所有节点（包括文件夹）
  totalSize: number;
  currentLang: 'zh' | 'en';
}

const state: AppState = {
  rootHandle: null,
  treeStructure: [],
  selectedItems: new Set(),
  allFiles: [],
  allNodes: [],
  totalSize: 0,
  currentLang: 'zh'
};

// DOM 元素
let selectFolderBtn: HTMLElement;
let refreshBtn: HTMLElement;
let projectTree: HTMLElement;
let selectedCountEl: HTMLElement;
let totalSizeEl: HTMLElement;
let generateBtn: HTMLButtonElement;
let promptPreview: HTMLElement;
let promptText: HTMLTextAreaElement;
let helpModal: HTMLElement;
let langToggleBtn: HTMLElement;
let helpBtn: HTMLElement;
let closeHelpBtn: HTMLElement;
let clearPromptBtn: HTMLElement;
let copyPromptBtn: HTMLButtonElement;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  // 获取 DOM 元素
  selectFolderBtn = document.getElementById('selectFolderBtn')!;
  refreshBtn = document.getElementById('refreshBtn')!;
  projectTree = document.getElementById('projectTree')!;
  selectedCountEl = document.getElementById('selectedCount')!;
  totalSizeEl = document.getElementById('totalSize')!;
  generateBtn = document.getElementById('generateBtn')! as HTMLButtonElement;
  promptPreview = document.getElementById('promptPreview')!;
  promptText = document.getElementById('promptText')! as HTMLTextAreaElement;
  helpModal = document.getElementById('helpModal')!;
  langToggleBtn = document.getElementById('langToggleBtn')!;
  helpBtn = document.getElementById('helpBtn')!;
  closeHelpBtn = document.getElementById('closeHelpBtn')!;
  clearPromptBtn = document.getElementById('clearPromptBtn')!;
  copyPromptBtn = document.getElementById('copyPromptBtn')! as HTMLButtonElement;

  // 绑定事件
  bindEvents();
  
  // 加载语言设置
  loadLanguageSetting();
});

// 绑定事件
function bindEvents() {
  // 选择文件夹
  selectFolderBtn.addEventListener('click', selectFolder);
  
  // 刷新
  refreshBtn.addEventListener('click', refreshFolder);
  
  // 生成目录结构
  generateBtn.addEventListener('click', generateStructure);
  
  // 复制 Prompt
  copyPromptBtn.addEventListener('click', copyPrompt);
  
  // 语言切换
  langToggleBtn.addEventListener('click', toggleLanguage);
  
  // 帮助浮窗
  helpBtn.addEventListener('click', () => helpModal.classList.remove('hidden'));
  closeHelpBtn.addEventListener('click', () => helpModal.classList.add('hidden'));
  helpModal.addEventListener('click', (e) => {
    if (e.target === helpModal) helpModal.classList.add('hidden');
  });
  
  // 清空 Prompt
  clearPromptBtn.addEventListener('click', () => {
    promptText.value = '';
    updateButtonStates();
  });
  
  // Prompt 编辑
  promptText.addEventListener('input', updateButtonStates);
}

// 加载语言设置
async function loadLanguageSetting() {
  try {
    const result = await chrome.storage.local.get('lang');
    if (result.lang && (result.lang === 'zh' || result.lang === 'en')) {
      state.currentLang = result.lang;
    }
    updateLanguage();
  } catch {
    // Chrome storage 可能不可用，使用默认语言
    updateLanguage();
  }
}

// 切换语言
async function toggleLanguage() {
  state.currentLang = state.currentLang === 'zh' ? 'en' : 'zh';
  updateLanguage();
  
  try {
    await chrome.storage.local.set({ lang: state.currentLang });
  } catch {
    // 忽略存储错误
  }
}

// 更新界面语言
function updateLanguage() {
  const texts = i18n[state.currentLang];
  
  // 头部
  document.getElementById('headerTitle')!.textContent = texts.headerTitle;
  
  // 按钮
  document.getElementById('selectFolderText')!.textContent = texts.selectFolder;
  document.getElementById('refreshText')!.textContent = texts.refresh;
  document.getElementById('generateText')!.textContent = texts.generateText;
  document.getElementById('copyPromptText')!.textContent = texts.copyPrompt;
  clearPromptBtn.title = texts.clear;
  
  // Prompt 区域
  document.getElementById('promptTitle')!.textContent = texts.promptTitle;
  promptText.placeholder = texts.promptPlaceholder;
  
  // 帮助浮窗
  document.getElementById('helpTitle')!.textContent = texts.helpTitle;
  document.getElementById('helpText')!.textContent = texts.helpText;
  
  // 空状态
  const emptyText = document.getElementById('emptyText');
  if (emptyText) {
    emptyText.textContent = texts.emptyText;
  }
  
  updateStatus();
  renderTree();
}

// 获取文本
function t(key: keyof typeof i18n.zh, params?: Record<string, string>): string {
  let text = i18n[state.currentLang][key];
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, v);
    });
  }
  return text;
}

// 选择文件夹
async function selectFolder() {
  try {
    const dirHandle = await (window as any).showDirectoryPicker({ mode: 'read' });
    
    state.rootHandle = dirHandle;
    state.selectedItems.clear();
    state.totalSize = 0;
    
    await loadTree();
  } catch (error) {
    if ((error as Error).name !== 'AbortError') {
      showError(t('loadFailed') + ': ' + (error as Error).message);
    }
  }
}

// 刷新文件夹
async function refreshFolder() {
  if (!state.rootHandle) return;
  
  const originalText = refreshBtn.innerHTML;
  refreshBtn.innerHTML = '⏳';
  refreshBtn.setAttribute('disabled', 'true');
  
  try {
    await loadTree();
    showSuccess(t('generateSuccess'));
  } catch (error) {
    showError(t('loadFailed') + ': ' + (error as Error).message);
  } finally {
    refreshBtn.innerHTML = originalText;
    refreshBtn.removeAttribute('disabled');
  }
}

// 加载树结构
async function loadTree() {
  projectTree.innerHTML = '<div class="empty-state"><p>正在扫描目录...</p></div>';
  
  const nodes = await scanDirectory(state.rootHandle!);
  state.treeStructure = nodes;
  state.allFiles = flattenFiles(nodes);
  state.allNodes = getAllNodes(nodes);
  
  renderTree();
  updateStatus();
  updateButtonStates();
}

// 获取所有节点（包括文件夹）
function getAllNodes(nodes: FileNode[]): FileNode[] {
  const result: FileNode[] = [];
  
  for (const node of nodes) {
    result.push(node);
    if (node.children) {
      result.push(...getAllNodes(node.children));
    }
  }
  
  return result;
}

// 渲染文件树
function renderTree() {
  if (state.treeStructure.length === 0) {
    projectTree.innerHTML = `<div class="empty-state"><p id="emptyText">${t('emptyText')}</p></div>`;
    return;
  }
  
  const html = renderTreeNodes(state.treeStructure, 0);
  projectTree.innerHTML = `<ul class="file-tree">${html}</ul>`;
  
  bindTreeEvents();
}

// 渲染树节点
function renderTreeNodes(nodes: FileNode[], depth: number): string {
  return nodes.map(node => {
    if (node.type === 'folder') {
      const hasChildren = node.children && node.children.length > 0;
      const isCollapsed = depth > 0;
      const isSelected = state.selectedItems.has(node.path);
      const childrenHtml = hasChildren 
        ? `<ul class="tree-children">${renderTreeNodes(node.children!, depth + 1)}</ul>` 
        : '';
      
      return `
        <li class="tree-item folder ${isCollapsed ? 'collapsed' : ''}" data-path="${node.path}">
          <div class="folder-content">
            <input type="checkbox" class="tree-checkbox folder-checkbox" 
                   ${isSelected ? 'checked' : ''} 
                   data-path="${node.path}">
            <span class="expand-icon">${isCollapsed ? '▶' : '▼'}</span>
            <span class="folder-icon">📁</span>
            <span class="file-name">${node.name}</span>
          </div>
          ${childrenHtml}
        </li>
      `;
    } else {
      const isSelected = state.selectedItems.has(node.path);
      const sizeStr = node.size ? formatSize(node.size) : '';
      
      return `
        <li class="tree-item file" data-path="${node.path}">
          <input type="checkbox" class="tree-checkbox" 
                 ${isSelected ? 'checked' : ''} 
                 data-path="${node.path}">
          <span class="file-icon">📄</span>
          <span class="file-name">${node.name}</span>
          <span class="file-size">${sizeStr}</span>
          <button class="copy-content-btn" 
                  data-path="${node.path}"
                  data-name="${node.name}"
                  title="${t('copyContent')}">
            📋 ${t('copyContent')}
          </button>
        </li>
      `;
    }
  }).join('');
}

// 绑定树事件
function bindTreeEvents() {
  // 文件夹展开/折叠
  projectTree.querySelectorAll('.tree-item.folder').forEach(folder => {
    const expandIcon = folder.querySelector('.expand-icon')!;
    
    expandIcon.addEventListener('click', (e) => {
      e.stopPropagation();
      folder.classList.toggle('collapsed');
      expandIcon.textContent = folder.classList.contains('collapsed') ? '▶' : '▼';
    });
  });
  
  // 文件夹勾选
  projectTree.querySelectorAll('.folder-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      const path = target.dataset.path!;
      toggleFolderSelection(path, target.checked);
      renderTree();
      updateStatus();
      updateButtonStates();
    });
  });
  
  // 文件勾选
  projectTree.querySelectorAll('.tree-item.file .tree-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      const path = target.dataset.path!;
      const file = state.allFiles.find(f => f.path === path);
      
      if (target.checked) {
        state.selectedItems.add(path);
        if (file && file.size) {
          state.totalSize += file.size;
        }
        // 自动勾选父文件夹
        selectParentFolders(path);
      } else {
        state.selectedItems.delete(path);
        if (file && file.size) {
          state.totalSize -= file.size;
        }
      }
      
      renderTree();
      updateStatus();
      updateButtonStates();
    });
  });
  
  // 复制文件内容按钮
  projectTree.querySelectorAll('.copy-content-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const target = e.target as HTMLButtonElement;
      const path = target.dataset.path!;
      const name = target.dataset.name || path.split('/').pop() || path;
      await copyFileContent(path, name);
    });
  });
}

// 自动勾选父文件夹
function selectParentFolders(path: string) {
  const parts = path.split('/');
  let currentPath = '';
  
  for (let i = 0; i < parts.length - 1; i++) {
    currentPath = currentPath ? `${currentPath}/${parts[i]}` : parts[i];
    state.selectedItems.add(currentPath);
  }
}

// 获取文件夹下的所有子节点（包括子文件夹和文件）
function getAllDescendants(folder: FileNode): FileNode[] {
  const result: FileNode[] = [];
  
  if (folder.children) {
    for (const child of folder.children) {
      result.push(child);
      if (child.type === 'folder') {
        result.push(...getAllDescendants(child));
      }
    }
  }
  
  return result;
}

// 切换文件夹选择（父子联动）
function toggleFolderSelection(folderPath: string, selected: boolean) {
  const folder = findNodeByPath(state.treeStructure, folderPath);
  if (!folder) return;
  
  // 获取所有后代节点（包括子文件夹和文件）
  const allDescendants = getAllDescendants(folder);
  
  if (selected) {
    // 勾选文件夹本身
    state.selectedItems.add(folderPath);
    
    // 勾选所有后代节点（子文件夹和文件）
    allDescendants.forEach(node => {
      state.selectedItems.add(node.path);
      if (node.type === 'file' && node.size) {
        state.totalSize += node.size;
      }
    });
  } else {
    // 取消勾选文件夹本身
    state.selectedItems.delete(folderPath);
    
    // 取消勾选所有后代节点
    allDescendants.forEach(node => {
      state.selectedItems.delete(node.path);
      if (node.type === 'file' && node.size) {
        state.totalSize -= node.size;
      }
    });
  }
}

// 根据路径查找节点
function findNodeByPath(nodes: FileNode[], path: string): FileNode | null {
  for (const node of nodes) {
    if (node.path === path) return node;
    if (node.children) {
      const found = findNodeByPath(node.children, path);
      if (found) return found;
    }
  }
  return null;
}

// 复制文件内容到剪贴板
async function copyFileContent(filePath: string, fileName: string) {
  const file = state.allFiles.find(f => f.path === filePath);
  if (!file) return;
  
  // 检查文件大小
  if (file.size && file.size > 100 * 1024) {
    showError(t('fileTooLarge', { size: formatSize(file.size) }));
    return;
  }
  
  try {
    const result = await loadFileContent(file);
    if (result.success && result.content) {
      // 格式化内容
      const formattedContent = `=======${fileName}-start========\n${result.content}\n=======${fileName}-end==========`;
      
      // 复制到剪贴板
      await navigator.clipboard.writeText(formattedContent);
      showSuccess(t('copySuccess'));
    } else {
      showError(t('loadFailed'));
    }
  } catch (error) {
    showError(t('copyFailed'));
  }
}

// 更新状态栏
function updateStatus() {
  const selectedCount = state.selectedItems.size;
  
  selectedCountEl.textContent = t('selectedCount', { count: selectedCount.toString() });
  totalSizeEl.textContent = t('totalSize', { size: formatSize(state.totalSize) });
}

// 更新按钮状态
function updateButtonStates() {
  const hasSelection = state.selectedItems.size > 0;
  const hasPrompt = promptText.value.trim().length > 0;
  
  generateBtn.disabled = !hasSelection;
  copyPromptBtn.disabled = !hasPrompt;
  
  // 显示/隐藏刷新按钮
  refreshBtn.style.display = state.rootHandle ? 'flex' : 'none';
  
  if (hasPrompt) {
    promptPreview.classList.remove('hidden');
  }
}

// 生成目录结构
async function generateStructure() {
  if (state.selectedItems.size === 0) {
    showError(t('noSelection'));
    return;
  }
  
  generateBtn.disabled = true;
  const originalText = generateBtn.innerHTML;
  generateBtn.innerHTML = '⏳...';
  
  try {
    // 生成目录结构（只生成勾选的项目）
    const treeString = buildTreeString(state.treeStructure, '', state.selectedItems);
    
    // 组装 Prompt
    let prompt = `## Project Structure\n\`\`\`\n${treeString}\n\`\`\`\n`;
    prompt += '\n\n## Task\n{Your task here}\n';
    
    promptText.value = prompt;
    promptPreview.classList.remove('hidden');
    
    showSuccess(t('generateSuccess'));
    updateButtonStates();
  } catch (error) {
    showError(t('loadFailed') + ': ' + (error as Error).message);
  } finally {
    generateBtn.disabled = false;
    generateBtn.innerHTML = originalText;
  }
}

// 构建树字符串（只生成勾选的项目）
function buildTreeString(
  nodes: FileNode[],
  prefix: string = '',
  selectedPaths: Set<string>
): string {
  let result = '';
  
  nodes.forEach((node, index) => {
    // 只处理勾选的项目
    if (!selectedPaths.has(node.path)) return;
    
    const isLast = index === nodes.length - 1;
    const connector = isLast ? '└── ' : '├── ';
    const childPrefix = prefix + (isLast ? '    ' : '│   ');
    
    if (node.type === 'folder') {
      result += `${prefix}${connector}☑ ${node.name}/\n`;
      
      if (node.children) {
        result += buildTreeString(node.children, childPrefix, selectedPaths);
      }
    } else {
      result += `${prefix}${connector}☑ ${node.name}\n`;
    }
  });
  
  return result;
}

// 复制 Prompt
async function copyPrompt() {
  try {
    await navigator.clipboard.writeText(promptText.value);
    showSuccess(t('copySuccess'));
  } catch (error) {
    showError(t('copyFailed'));
  }
}

// 显示错误消息
function showError(message: string) {
  showMessage(message, 'error');
}

// 显示成功消息
function showSuccess(message: string) {
  showMessage(message, 'success');
}

// 显示消息
function showMessage(message: string, type: 'error' | 'success' | 'warning') {
  const existing = document.querySelector('.message-toast');
  if (existing) existing.remove();
  
  const div = document.createElement('div');
  div.className = `message-toast ${type}-message`;
  div.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 13px;
    z-index: 1001;
    animation: fadeIn 0.3s;
  `;
  
  if (type === 'error') {
    div.style.background = '#fee';
    div.style.color = '#c00';
  } else if (type === 'success') {
    div.style.background = '#d4edda';
    div.style.color = '#155724';
  } else {
    div.style.background = '#fff3cd';
    div.style.color = '#856404';
  }
  
  div.textContent = message;
  document.body.appendChild(div);
  
  setTimeout(() => {
    div.style.animation = 'fadeOut 0.3s';
    setTimeout(() => div.remove(), 300);
  }, 3000);
}

console.log('Sidepanel loaded');
