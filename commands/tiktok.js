// commands/tiktok.js
const Tiktok = require("@tobyg74/tiktok-api-dl");

async function handleTikTok(sock, msg, from, args) {
    // Validasi URL
    if (!args[0]) {
        return sock.sendMessage(from, {
            text: `❌ Masukkan link TikTok.\nContoh: !tiktok https://vt.tiktok.com/xxxx`
        }, { quoted: msg });
    }

    let videoUrl = args[0];
    if (!videoUrl.includes('tiktok.com')) {
        return sock.sendMessage(from, {
            text: '❌ Link TikTok tidak valid.'
        }, { quoted: msg });
    }

    // Kirim pesan proses
    await sock.sendMessage(from, {
        text: '⏳ Sedang mengambil video TikTok...'
    }, { quoted: msg });

    try {
        // Gunakan pustaka baru
        const result = await Tiktok.Downloader(videoUrl, {
            version: "v1" // atau "v2", "v3". coba v1 dulu
        });

        if (result && result.status === 'success' && result.result) {
            const downloadUrl = result.result.video;
            await sock.sendMessage(from, {
                video: { url: downloadUrl },
                mimetype: 'video/mp4',
                caption: `✅ TikTok berhasil diunduh!\n\nDeskripsi: ${result.result.desc || '-'}`
            }, { quoted: msg });
        } else {
            await sock.sendMessage(from, {
                text: '❌ Gagal mengunduh video. Mungkin tautan tidak valid atau server sedang sibuk.'
            }, { quoted: msg });
        }
    } catch (err) {
        console.error('TIKTOK ERROR:', err);
        // Kirim pesan error detail (untuk debug)
        await sock.sendMessage(from, {
            text: `❌ Terjadi kesalahan: ${err.message || 'Gagal mengunduh video TikTok.'}`
        }, { quoted: msg });
    }
}

module.exports = { handleTikTok };