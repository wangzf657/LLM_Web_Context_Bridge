// 文件扫描模块

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  size?: number;
  children?: FileNode[];
  handle?: FileSystemFileHandle | FileSystemDirectoryHandle;
}

const IGNORED_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  'out',
  '.cache',
  '__pycache__',
  '.DS_Store',
  'Thumbs.db'
]);

const IGNORED_EXTENSIONS = new Set([
  '.lock',
  '.log',
  '.bak',
  '.swp',
  '.swo'
]);

// 扫描目录
export async function scanDirectory(
  dirHandle: FileSystemDirectoryHandle,
  basePath: string = ''
): Promise<FileNode[]> {
  const nodes: FileNode[] = [];
  
  // 使用 for await...of 遍历目录
  const entries: [string, FileSystemHandle][] = [];
  for await (const entry of dirHandle.values()) {
    entries.push([entry.name, entry]);
  }
  
  // 排序：文件夹在前，文件在后，按字母排序
  entries.sort((a, b) => {
    const aIsDir = a[1].kind === 'directory';
    const bIsDir = b[1].kind === 'directory';
    if (aIsDir && !bIsDir) return -1;
    if (!aIsDir && bIsDir) return 1;
    return a[0].localeCompare(b[0]);
  });
  
  for (const [name, handle] of entries) {
    const path = basePath ? `${basePath}/${name}` : name;
    
    // 跳过忽略的目录
    if (handle.kind === 'directory' && IGNORED_DIRS.has(name)) {
      continue;
    }
    
    if (handle.kind === 'file') {
      // 检查文件扩展名
      const ext = '.' + name.split('.').pop();
      if (IGNORED_EXTENSIONS.has(ext)) {
        continue;
      }
      
      const file = await (handle as FileSystemFileHandle).getFile();
      nodes.push({
        name,
        path,
        type: 'file',
        size: file.size,
        handle: handle as FileSystemFileHandle
      });
    } else if (handle.kind === 'directory') {
      const children = await scanDirectory(handle as FileSystemDirectoryHandle, path);
      if (children.length > 0) {
        nodes.push({
          name,
          path,
          type: 'folder',
          children,
          handle: handle as FileSystemDirectoryHandle
        });
      }
    }
  }
  
  return nodes;
}

// 获取所有文件节点（扁平化）
export function flattenFiles(nodes: FileNode[]): FileNode[] {
  const files: FileNode[] = [];
  
  for (const node of nodes) {
    if (node.type === 'file') {
      files.push(node);
    } else if (node.children) {
      files.push(...flattenFiles(node.children));
    }
  }
  
  return files;
}
