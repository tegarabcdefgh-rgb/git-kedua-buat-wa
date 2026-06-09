const axios = require('axios')

async function handleTikTok(sock, msg, from, args) {

    if (!args[0]) {
        return sock.sendMessage(
            from,
            {
                text: 'Contoh:\n!tiktok https://vt.tiktok.com/xxxx'
            },
            { quoted: msg }
        )
    }

    const url = args[0]

    try {

        await sock.sendMessage(
            from,
            {
                text: '⏳ Sedang mengambil video TikTok...'
            },
            { quoted: msg }
        )

        // Ganti dengan API downloader yang kamu gunakan
        const response = await axios.get(
            `API_DOWNLOADER_KAMU?url=${encodeURIComponent(url)}`
        )

        const videoUrl = response.data.video

        await sock.sendMessage(
            from,
            {
                video: { url: videoUrl },
                caption: '✅ Berhasil diunduh'
            },
            { quoted: msg }
        )

    } catch (err) {

        console.error(err)

        await sock.sendMessage(
            from,
            {
                text: '❌ Gagal mengunduh video TikTok.'
            },
            { quoted: msg }
        )
    }
}

module.exports = { handleTikTok }