// 生成简单的占位图标
const fs = require('fs');
const path = require('path');

// 简单的 SVG 图标
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <rect width="128" height="128" fill="#10a37f" rx="16"/>
  <text x="64" y="75" font-family="Arial, sans-serif" font-size="64" font-weight="bold" text-anchor="middle" fill="white">📦</text>
</svg>`;

const iconsDir = path.join(__dirname, '../public/icons');

// 确保目录存在
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// 创建简单的 PNG 占位符（使用 base64）
// 这是一个 16x16 的绿色方块
const simplePngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAFklEQVR42mNgGAWjYBSMglEwCkYBDQAAAHYAAwDWplOaAAAAAElFTkSuQmCC';

const buffer = Buffer.from(simplePngBase64, 'base64');

fs.writeFileSync(path.join(iconsDir, 'icon16.png'), buffer);
fs.writeFileSync(path.join(iconsDir, 'icon48.png'), buffer);
fs.writeFileSync(path.join(iconsDir, 'icon128.png'), buffer);

console.log('Icons generated successfully');
