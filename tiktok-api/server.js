const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { v4: uuidv4 } = require('uuid');

const execPromise = promisify(exec);
const app = express();
const PORT = 3000;

// Gunakan yt-dlp.exe dari folder yang sama (sesuaikan jika pakai git bash)
const ytdlp = '.\\yt-dlp.exe'; // untuk CMD Windows
// const ytdlp = './yt-dlp.exe'; // untuk PowerShell atau Git Bash

app.use(cors());
app.use(express.json());

// Endpoint untuk mendapatkan metadata video
app.get('/api/download-tiktok', async (req, res) => {
    const videoUrl = req.query.url;
    if (!videoUrl) {
        return res.status(400).json({ error: 'Parameter URL diperlukan' });
    }
    if (!videoUrl.includes('tiktok.com')) {
        return res.status(400).json({ error: 'URL tidak valid. Harus dari tiktok.com' });
    }
    try {
        const { stdout } = await execPromise(`${ytdlp} -j --no-warnings "${videoUrl}"`);
        const data = JSON.parse(stdout);
        res.json({
            status: 'success',
            video_url: data.url,
            title: data.title,
            uploader: data.uploader,
            view_count: data.view_count,
            like_count: data.like_count,
            comment_count: data.comment_count,
            repost_count: data.repost_count,
            description: data.description,
        });
    } catch (error) {
        console.error('Error metadata:', error.message);
        res.status(500).json({ error: 'Gagal memproses video TikTok', details: error.message });
    }
});

// Endpoint untuk mengunduh video (langsung mengirim file)
app.get('/api/download-video', async (req, res) => {
    const videoUrl = req.query.url;
    if (!videoUrl) return res.status(400).json({ error: 'URL required' });
    if (!videoUrl.includes('tiktok.com')) return res.status(400).json({ error: 'Invalid TikTok URL' });

    const tempFile = path.join(__dirname, `temp_${uuidv4()}.mp4`);
    try {
        await execPromise(`${ytdlp} -o "${tempFile}" -f mp4 "${videoUrl}"`);
        res.sendFile(tempFile, (err) => {
            if (err) console.error('Error sending file:', err);
            // Hapus file setelah dikirim
            fs.unlink(tempFile, (e) => e && console.error('Error deleting temp file:', e));
        });
    } catch (error) {
        console.error('Error downloading video:', error.message);
        if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
        res.status(500).json({ error: 'Gagal mengunduh video', details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`✅ TikTok API berjalan di http://localhost:${PORT}`);
    console.log(`📱 Contoh metadata: http://localhost:3000/api/download-tiktok?url=https://vt.tiktok.com/ZSQfvJaFC/`);
    console.log(`📥 Contoh unduh video: http://localhost:3000/api/download-video?url=https://vt.tiktok.com/ZSQfvJaFC/`);
});