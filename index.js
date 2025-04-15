const express = require('express');
const ytdl = require('ytdl-core');
const path = require('path');

const app = express();

// publicフォルダ内の静的ファイル（HTML、CSS、画像など）を配信
app.use(express.static(path.join(__dirname, 'public')));

app.get('/video', (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl || !ytdl.validateURL(videoUrl)) {
    return res.status(400).send('正しい動画URLを指定してください');
  }

  // ファイル名は固定にしておく（例: "video.mp4"）
  res.setHeader('Content-Disposition', 'inline; filename="video.mp4"');
  
  // 直接動画をストリーミング
  ytdl(videoUrl, { quality: 'highestvideo' })
    .on('error', err => {
      console.error('ストリーミングエラー:', err);
      res.status(500).send('動画の取得中にエラーが発生しました');
    })
    .pipe(res);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`サーバーはポート ${PORT} で起動中`);
});
