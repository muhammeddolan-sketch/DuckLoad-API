const express = require('express');
const YTDlpWrap = require('yt-dlp-wrap').default;
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const ytDlp = new YTDlpWrap('/usr/bin/yt-dlp');

app.post('/get-video-url', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL gerekli' });

  try {
    const videoInfo = await ytDlp.getVideoInfo(url);
    const format = videoInfo.formats
      ?.filter(f => f.url && f.ext === 'mp4')
      ?.sort((a, b) => (b.height || 0) - (a.height || 0))[0];

    if (!format?.url) return res.status(404).json({ error: 'Video bulunamadı' });

    return res.json({
      videoUrl: format.url,
      title: videoInfo.title || 'Video',
      duration: videoInfo.duration,
      thumbnail: videoInfo.thumbnail,
    });
  } catch (e) {
    return res.status(500).json({ error: 'Video çıkarılamadı: ' + e.message });
  }
});

app.get('/', (req, res) => {
  res.json({ status: 'DuckLoad API çalışıyor 🦆' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`DuckLoad API port ${PORT} üzerinde çalışıyor`);
});

// Kapanmayı engelle
process.on('uncaughtException', (err) => {
  console.error('Hata:', err.message);
});