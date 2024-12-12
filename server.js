const express = require('express');
const path = require('path');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
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

        // إعداد مسارات التحميل
        const videoPath = `downloads/${videoInfo.videoDetails.title}-video.mp4`;
        const audioPath = `downloads/${videoInfo.videoDetails.title}-audio.mp3`;

        // تحميل الفيديو
        ffmpeg(ytdl(videoUrl, { quality: 'highestvideo' }))
            .save(videoPath)
            .on('end', () => {
                console.log('تم حفظ الفيديو');
            });

        // تحميل الصوت
        ffmpeg(ytdl(videoUrl, { quality: 'highestaudio' }))
            .save(audioPath)
            .on('end', () => {
                console.log('تم حفظ الصوت');
            });

        // إرسال روابط الملفات إلى الواجهة
        res.json({
            videoUrl: `http://localhost:3000/${videoPath}`,
            audioUrl: `http://localhost:3000/${audioPath}`,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'حدث خطأ أثناء التحويل' });
    }
});

// إعداد الخادم على المنفذ 3000
app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});
