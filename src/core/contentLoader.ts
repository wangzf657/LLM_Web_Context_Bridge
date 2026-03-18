// 内容加载模块

import { FileNode } from './fileScanner';

const MAX_FILE_SIZE = 100 * 1024; // 100KB

export interface ContentLoadResult {
  success: boolean;
  content?: string;
  error?: string;
}

// 加载单个文件内容
export async function loadFileContent(
  fileNode: FileNode
): Promise<ContentLoadResult> {
  try {
    const handle = fileNode.handle as FileSystemFileHandle;
    const file = await handle.getFile();
    
    // 检查文件大小
    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: `文件过大 (${formatSize(file.size)} > ${formatSize(MAX_FILE_SIZE)})`
      };
    }
    
    const content = await file.text();
    return { success: true, content };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '读取失败'
    };
  }
}

// 格式化文件大小
export function formatSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes}B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)}KB`;
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  }
}
