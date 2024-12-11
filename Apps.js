const express = require('express');
const ytdl = require('ytdl-core');

const app = express();
const port = 3000;

app.get('/', (req, res) => {
    res.send('YouTube Downloader');
});

app.get('/download', (req, res) => {
    const videoURL = req.query.url;
    if (!ytdl.validateURL(videoURL)) {
        return res.status(400).send('Invalid YouTube URL');
    }

    res.header('Content-Disposition', 'attachment; filename=video.mp4');
    ytdl(videoURL, { quality: 'highestvideo' }).pipe(res);
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
