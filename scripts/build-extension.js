const { defineConfig } = require('vite');
const { resolve } = require('path');
const fs = require('fs');

// 复制目录
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src);
  for (const entry of entries) {
    const srcPath = resolve(src, entry);
    const destPath = resolve(dest, entry);
    
    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// 删除文件
function deleteFile(path) {
  if (fs.existsSync(path)) {
    fs.unlinkSync(path);
  }
}

module.exports = defineConfig({
  root: resolve(__dirname, '../src'),
  publicDir: resolve(__dirname, '../public'),
  build: {
    outDir: resolve(__dirname, '../dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        sidepanel: resolve(__dirname, '../src/sidepanel.html'),
        background: resolve(__dirname, '../src/background/index.ts'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'background') return 'background.js';
          if (chunkInfo.name === 'sidepanel') return 'sidepanel.js';
          return '[name].js';
        },
        chunkFileNames: 'chunks/[name].[hash].js',
        assetFileNames: '[name].[ext]'
      }
    },
    cssCodeSplit: false,
    minify: false,
    sourcemap: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '../src')
    }
  },
  plugins: [
    {
      name: 'copy-extension-files',
      closeBundle() {
        const distDir = resolve(__dirname, '../dist');
        
        // 复制 manifest.json
        fs.copyFileSync(
          resolve(__dirname, '../src/manifest.json'),
          resolve(distDir, 'manifest.json')
        );
        
        // 复制图标
        const iconsSrc = resolve(__dirname, '../public/icons');
        const iconsDest = resolve(distDir, 'icons');
        if (fs.existsSync(iconsSrc)) {
          copyDir(iconsSrc, iconsDest);
        }
        
        // 清理多余的文件（如果有 src 目录）
        const srcDir = resolve(distDir, 'src');
        if (fs.existsSync(srcDir)) {
          fs.rmSync(srcDir, { recursive: true, force: true });
        }
        
        console.log('Extension built successfully!');
      }
    }
  ]
});
