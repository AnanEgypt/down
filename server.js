const express = require('express');
const path = require('path');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const app = express();

// تحديد مجلد public
app.use(express.static(path.join(__dirname, 'public')));

// تقديم الصفحة الرئيسية
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// نقطة النهاية لتحويل الفيديو
app.get('/convert', async (req, res) => {
    const videoUrl = req.query.url;

    // تحقق من صحة الرابط
    if (!videoUrl || !ytdl.validateURL(videoUrl)) {
        return res.status(400).json({ error: 'رابط يوتيوب غير صالح' });
    }

    try {
        const videoInfo = await ytdl.getInfo(videoUrl);

        // إرسال روابط الفيديو والصوت إلى الواجهة
        res.json({
            videoUrl: `/download-video?url=${encodeURIComponent(videoUrl)}`,
            audioUrl: `/download-audio?url=${encodeURIComponent(videoUrl)}`,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'حدث خطأ أثناء التحويل' });
    }
});

// نقطة النهاية لتحميل الفيديو
app.get('/download-video', (req, res) => {
    const videoUrl = req.query.url;

    // تحقق من صحة الرابط
    if (!videoUrl || !ytdl.validateURL(videoUrl)) {
        return res.status(400).json({ error: 'رابط يوتيوب غير صالح' });
    }

    const videoStream = ytdl(videoUrl, { quality: 'highestvideo' });
    res.setHeader('Content-Type', 'video/mp4');
    videoStream.pipe(res);
});

// نقطة النهاية لتحميل الصوت
app.get('/download-audio', (req, res) => {
    const audioUrl = req.query.url;

    // تحقق من صحة الرابط
    if (!audioUrl || !ytdl.validateURL(audioUrl)) {
        return res.status(400).json({ error: 'رابط يوتيوب غير صالح' });
    }

    const audioStream = ytdl(audioUrl, { quality: 'highestaudio' });
    res.setHeader('Content-Type', 'audio/mp3');
    audioStream.pipe(res);
});

// إعداد الخادم على المنفذ 3000
app.listen(3001, () => {
    console.log('Server running at http://localhost:3000');
});
