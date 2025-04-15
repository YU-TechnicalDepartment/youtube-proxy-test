const express = require('express');
const ytdl = require('ytdl-core');
const path = require('path');

const app = express();

// publicフォルダ内の静的ファイルを配信
app.use(express.static(path.join(__dirname, 'public')));

app.get('/video', (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl || !ytdl.validateURL(videoUrl)) {
    return res.status(400).send('正しい動画URLを指定してください');
  }

  // ファイル名は固定にしておく
  res.setHeader('Content-Disposition', 'inline; filename="video.mp4"');

  // ここで quality オプションを 'highest' に変更（状況に応じて調整）
  const videoStream = ytdl(videoUrl, { quality: 'highest' });
  
  videoStream.pipe(res);

  videoStream.on('error', err => {
    console.error('ストリーミングエラー:', err);
    if (!res.headersSent) {
      res.status(500).send('動画の取得中にエラーが発生しました');
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`サーバーはポート ${PORT} で起動中`);
});
