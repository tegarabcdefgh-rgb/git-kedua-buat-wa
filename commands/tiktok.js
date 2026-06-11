// commands/tiktok.js
function formatNumber(num) {
    if (!num && num !== 0) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

async function handleTikTok(sock, msg, from, args) {
    if (!args[0]) {
        return sock.sendMessage(from, { text: `❌ Masukkan link TikTok.\nContoh: !tiktok https://vt.tiktok.com/xxxx` }, { quoted: msg });
    }
    let videoUrl = args[0];
    if (!videoUrl.includes('tiktok.com')) {
        return sock.sendMessage(from, { text: '❌ Link TikTok tidak valid.' }, { quoted: msg });
    }
    await sock.sendMessage(from, { text: '⏳ Sedang memproses video TikTok...' }, { quoted: msg });

    try {
        // 1. Ambil metadata dari API
        const metaUrl = `http://localhost:3000/api/download-tiktok?url=${encodeURIComponent(videoUrl)}`;
        const metaRes = await fetch(metaUrl);
        const meta = await metaRes.json();
        if (!metaRes.ok || meta.status !== 'success') throw new Error(meta.error || 'Gagal ambil metadata');

        // 2. Unduh video dari endpoint download-video
        const videoEndpoint = `http://localhost:3000/api/download-video?url=${encodeURIComponent(videoUrl)}`;
        const videoRes = await fetch(videoEndpoint);
        if (!videoRes.ok) throw new Error(`Gagal unduh video: ${videoRes.status}`);
        const videoBuffer = Buffer.from(await videoRes.arrayBuffer());

        // 3. Buat caption
        const caption = `🎬 *${meta.uploader}*\n\n📝 *Deskripsi:* ${meta.description || '-'}\n\n📊 *Statistik:*\n👀 Views: ${formatNumber(meta.view_count)}\n❤️ Likes: ${formatNumber(meta.like_count)}\n💬 Komentar: ${formatNumber(meta.comment_count)}\n🔄 Share: ${formatNumber(meta.repost_count)}\n\n✅ Diunduh oleh Juun 👾`;

        // 4. Kirim video
        await sock.sendMessage(from, {
            video: videoBuffer,
            mimetype: 'video/mp4',
            caption: caption
        }, { quoted: msg });
    } catch (err) {
        console.error('[TikTok Error]', err);
        await sock.sendMessage(from, { text: `❌ Gagal: ${err.message}` }, { quoted: msg });
    }
}

module.exports = { handleTikTok };