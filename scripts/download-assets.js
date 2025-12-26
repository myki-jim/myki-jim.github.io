const fs = require('fs');
const path = require('path');
const https = require('https');

const assetsDir = path.join(__dirname, '../public/images');
const avatarUrl = 'https://github.com/myki-jim.png';
const avatarPath = path.join(assetsDir, 'avatar.png');

// 确保目录存在
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);

    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Handle redirects
        https.get(response.headers.location, (redirectResponse) => {
          redirectResponse.pipe(file);
          file.on('finish', () => {
            file.close();
            resolve();
          });
        }).on('error', (err) => {
          fs.unlink(dest, () => {});
          reject(err);
        });
      } else {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      }
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function downloadAssets() {
  try {
    console.log('📥 正在下载头像...');
    await downloadFile(avatarUrl, avatarPath);
    console.log('✅ 头像已保存到 public/images/avatar.png');
  } catch (error) {
    console.error('❌ 下载头像失败:', error.message);
    console.log('ℹ️  将使用 GitHub 头像链接作为备选');
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  downloadAssets();
}

module.exports = downloadAssets;
