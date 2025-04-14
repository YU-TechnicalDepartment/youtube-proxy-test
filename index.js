const express = require('express');
const ytdl = require('ytdl-core');
const path = require('path');

const app = express();

// publicフォルダ内の静的ファイル（HTML、CSS、画像など）を配信
app.use(express.static(path.join(__dirname, 'public')));

app.get('/video', async (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl || !ytdl.validateURL(videoUrl)) {
    return res.status(400).send('正しい動画URLを指定してください');
  }

  try {
    const info = await ytdl.getInfo(videoUrl);
    const duration = parseInt(info.videoDetails.lengthSeconds, 10);
    // 2分（120秒）を超える動画は許可しない
    if (duration > 120) {
      return res.status(403).send('視聴できるのは2分以内の動画のみです');
    }
    
    // タイトルから不要な文字を除去し、ダウンロード時のファイル名として設定
    const videoTitle = info.videoDetails.title.replace(/[^a-zA-Z0-9\-_. ]/g, "");
    res.setHeader('Content-Disposition', `inline; filename="${videoTitle}.mp4"`);
    
    // ytdl-core で動画をストリーミング
    ytdl(videoUrl, { quality: 'highestvideo' })
      .on('error', err => {
        console.error('ストリーミングエラー:', err);
        res.status(500).send('動画の取得中にエラーが発生しました');
      })
      .pipe(res);
      
  } catch (error) {
    console.error('取得エラー:', error);
    res.status(500).send('動画情報の取得に失敗しました');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`サーバーはポート ${PORT} で起動中`);
});
