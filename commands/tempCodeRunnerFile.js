const sharp = require('sharp')
const fs = require('fs')
const path = require('path')
const axios = require('axios')
const { exec } = require('child_process')
const ffmpegPath = require('ffmpeg-static')
 
// ─── Konversi gambar ke WebP stiker ────────────────────────────────────────
async function imageToSticker(buffer, options = {}) {
  const {
    packName = 'Bot Stiker',
    authorName = 'WA Bot',
    crop = false,
  } = options
 
  try {
    let img = sharp(buffer).resize(512, 512, {
      fit: crop ? 'cover' : 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
 
    const webpBuffer = await img
      .webp({ quality: 80, lossless: false })
      .toBuffer()
 
    return webpBuffer
  } catch (err) {
    throw new Error('Gagal mengkonversi gambar: ' + err.message)
  }
}
 
// ─── Konversi video/GIF ke stiker animasi ──────────────────────────────────
function videoToAnimatedSticker(inputBuffer, ext = 'mp4') {
  return new Promise((resolve, reject) => {
    const tmpDir = './tmp'
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir)
 
    const inputPath = path.join(tmpDir, `stiker_in_${Date.now()}.${ext}`)
    const outputPath = path.join(tmpDir, `stiker_out_${Date.now()}.webp`)
 
    fs.writeFileSync(inputPath, inputBuffer)
 
    // ffmpeg: resize ke 512x512, max 6 detik, 15fps
    const cmd = `"${ffmpegPath}" -i "${inputPath}" -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=white@0,fps=15" -loop 0 -ss 00:00:00 -t 00:00:06 -preset default -an -vsync 0 -s 512:512 "${outputPath}" -y`
 
    exec(cmd, (err) => {
      // Hapus file input sementara
      try { fs.unlinkSync(inputPath) } catch (_) {}
 
      if (err) {
        reject(new Error('Gagal konversi video: ' + err.message))
        return
      }
 
      const result = fs.readFileSync(outputPath)
      try { fs.unlinkSync(outputPath) } catch (_) {}
      resolve(result)
    })
  })
}
 
// ─── Download media dari pesan ─────────────────────────────────────────────
async function downloadMedia(sock, msg) {
  const { downloadMediaMessage } = require('@whiskeysockets/baileys')
  const buffer = await downloadMediaMessage(msg, 'buffer', {}, {
    logger: require('pino')({ level: 'silent' }),
    reuploadRequest: sock.updateMediaMessage,
  })
  return buffer
}
 
// ─── Handler utama perintah stiker ─────────────────────────────────────────
async function handleSticker(sock, msg, from, args) {
  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
  const msgType = Object.keys(msg.message || {})[0]
 
  // Opsi tambahan dari argumen
  const crop = args.includes('--crop') || args.includes('-c')
  const stickerOptions = { packName: 'Bot Stiker', authorName: 'WA Bot', crop }
 
  // ── Kasus 1: Reply ke pesan gambar ──
  if (quoted) {
    const quotedType = Object.keys(quoted)[0]
 
    if (quotedType === 'imageMessage') {
      await sock.sendMessage(from, { react: { text: '⏳', key: msg.key } })
 
      const quotedMsg = {
        ...msg,
        message: quoted,
        key: { ...msg.key, id: msg.message.extendedTextMessage.contextInfo.stanzaId },
      }
 
      const buffer = await downloadMedia(sock, { message: quoted, ...quotedMsg })
      const webp = await imageToSticker(buffer, stickerOptions)
 
      await sock.sendMessage(from, {
        sticker: webp,
        mimetype: 'image/webp',
      })
      await sock.sendMessage(from, { react: { text: '✅', key: msg.key } })
      return
    }
 
    if (quotedType === 'videoMessage' || quotedType === 'gifMessage') {
      await sock.sendMessage(from, { react: { text: '⏳', key: msg.key } })
      await sock.sendMessage(from, { text: '⏳ Memproses stiker animasi, harap tunggu...' }, { quoted: msg })
 
      const ext = quotedType === 'gifMessage' ? 'gif' : 'mp4'
      const buffer = await downloadMedia(sock, { message: quoted, ...msg })
      const webp = await videoToAnimatedSticker(buffer, ext)
 
      await sock.sendMessage(from, {
        sticker: webp,
        mimetype: 'image/webp',
      })
      await sock.sendMessage(from, { react: { text: '✅', key: msg.key } })
      return
    }
  }
 
  // ── Kasus 2: Kirim gambar langsung dengan caption !stiker ──
  if (msgType === 'imageMessage') {
    await sock.sendMessage(from, { react: { text: '⏳', key: msg.key } })
    const buffer = await downloadMedia(sock, msg)
    const webp = await imageToSticker(buffer, stickerOptions)
 
    await sock.sendMessage(from, { sticker: webp, mimetype: 'image/webp' })
    await sock.sendMessage(from, { react: { text: '✅', key: msg.key } })
    return
  }
 
  // ── Kasus 3: URL gambar dari argumen ──
  const urlArg = args.find(a => a.startsWith('http'))
  if (urlArg) {
    try {
      await sock.sendMessage(from, { react: { text: '⏳', key: msg.key } })
      const res = await axios.get(urlArg, { responseType: 'arraybuffer', timeout: 10000 })
      const buffer = Buffer.from(res.data)
      const webp = await imageToSticker(buffer, stickerOptions)
 
      await sock.sendMessage(from, { sticker: webp, mimetype: 'image/webp' })
      await sock.sendMessage(from, { react: { text: '✅', key: msg.key } })
    } catch {
      await sock.sendMessage(from, { text: '❌ Gagal mengambil gambar dari URL.' }, { quoted: msg })
    }
    return
  }
 
  // ── Panduan jika tidak ada media ──
  await sock.sendMessage(from, {
    text: `🖼️ *Cara buat stiker:*\n\n` +
      `1️⃣ Kirim gambar dengan caption *!stiker*\n` +
      `2️⃣ Reply gambar/GIF/video lalu ketik *!stiker*\n` +
      `3️⃣ *!stiker [URL gambar]*\n\n` +
      `📌 Tambah \`--crop\` untuk stiker kotak penuh\n` +
      `Contoh: *!stiker --crop*`,
  }, { quoted: msg })
}
 
module.exports = { handleSticker }