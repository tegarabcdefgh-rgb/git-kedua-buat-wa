const axios = require('axios')

async function resolveTikTokURL(shortUrl) {
    try {
        const res = await axios.get(shortUrl, {
            maxRedirects: 10,
            validateStatus: (status) => status < 400
        })
        return res.request.res.responseUrl || shortUrl
    } catch (err) {
        return shortUrl
    }
}

async function handleTikTok(sock, msg, from, args) {

    if (!args[0]) {
        return sock.sendMessage(
            from,
            {
                text:
`❌ Masukkan link TikTok

Contoh:
!tiktok https://vt.tiktok.com/xxxx`
            },
            { quoted: msg }
        )
    }

    let videoUrl = args[0]

    if (!videoUrl.includes('tiktok.com')) {
        return sock.sendMessage(
            from,
            { text: '❌ Link TikTok tidak valid.' },
            { quoted: msg }
        )
    }

    try {

        await sock.sendMessage(
            from,
            { text: '⏳ Sedang mengambil video TikTok...' },
            { quoted: msg }
        )

        // ✅ FIX 1: Resolve URL pendek dulu
        if (
            videoUrl.includes('vt.tiktok.com') ||
            videoUrl.includes('vm.tiktok.com')
        ) {
            videoUrl = await resolveTikTokURL(videoUrl)
            console.log('Resolved URL:', videoUrl)
        }

        const response = await axios.get(
            'https://tiktok-video-downloader-api.p.rapidapi.com/media',
            {
                params: {
                    url: videoUrl  // ✅ FIX 2: ganti 'videoUrl' → 'url'
                },
                headers: {
                    'x-rapidapi-key': process.env.RAPID_API_KEY,
                    'x-rapidapi-host': 'tiktok-video-downloader-api.p.rapidapi.com'
                }
            }
        )

        console.log('TIKTOK API RESPONSE:', response.data)

        const downloadUrl = response.data.downloadUrl

        if (!downloadUrl) {
            return sock.sendMessage(
                from,
                {
                    text: '❌ Video tidak ditemukan atau API tidak mengembalikan link video.'
                },
                { quoted: msg }
            )
        }

        await sock.sendMessage(
            from,
            {
                video: { url: downloadUrl },
                mimetype: 'video/mp4',
                caption: '✅ TikTok berhasil diunduh'
            },
            { quoted: msg }
        )

    } catch (err) {

        console.error('TIKTOK ERROR:', err.response?.data || err)

        await sock.sendMessage(
            from,
            {
                text:
`❌ Gagal mengunduh video TikTok.

${err.response?.data?.message || err.message}`
            },
            { quoted: msg }
        )
    }
}

module.exports = {
    handleTikTok
}