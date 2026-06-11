const fs = require('fs')
const path = require('path')

const DATA_FILE = path.join(__dirname, '../data/leaderboard.json')

function loadData() {
    if (!fs.existsSync(DATA_FILE)) {
        fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true })
        fs.writeFileSync(DATA_FILE, JSON.stringify({}))
    }
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'))
}

function saveData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
}

function getPlayerData(groupId, playerId, playerName) {
    const data = loadData()
    if (!data[groupId]) data[groupId] = {}
    if (!data[groupId][playerId]) {
        data[groupId][playerId] = { name: playerName, points: 50 }
        saveData(data)
    }
    return data[groupId][playerId]
}

function updatePoints(groupId, playerId, playerName, delta) {
    const data = loadData()
    if (!data[groupId]) data[groupId] = {}
    if (!data[groupId][playerId]) {
        data[groupId][playerId] = { name: playerName, points: 50 }
    }
    data[groupId][playerId].name = playerName
    data[groupId][playerId].points += delta
    if (data[groupId][playerId].points < 0) data[groupId][playerId].points = 0
    saveData(data)
    return data[groupId][playerId].points
}

// ================================
// SOAL LIST
// ================================
const soalList = [
    { emoji: '🌊🏄', answer: 'surfing', hint: 'Olahraga air' },
    { emoji: '🍚🍳🥚', answer: 'nasi goreng', hint: 'Makanan Indonesia' },
    { emoji: '👑🦁', answer: 'raja singa', hint: 'Film animasi' },
    { emoji: '🌍✈️🧳', answer: 'traveling', hint: 'Aktivitas' },
    { emoji: '📱💬❤️', answer: 'chat romantis', hint: 'Aktivitas' },
    { emoji: '🎵🎤🎶', answer: 'menyanyi', hint: 'Aktivitas' },
    { emoji: '🌙⭐🌌', answer: 'malam berbintang', hint: 'Pemandangan' },
    { emoji: '🏃💨🥇', answer: 'lari cepat', hint: 'Olahraga' },
    { emoji: '📚✏️🏫', answer: 'belajar di sekolah', hint: 'Aktivitas' },
    { emoji: '🎂🕯️🎉', answer: 'ulang tahun', hint: 'Perayaan' },
    { emoji: '🌧️☂️👢', answer: 'hujan hujan', hint: 'Cuaca' },
    { emoji: '🍕🍔🍟', answer: 'makanan cepat saji', hint: 'Makanan' },
    { emoji: '🐍🪜', answer: 'ular tangga', hint: 'Permainan' },
    { emoji: '💔😭', answer: 'patah hati', hint: 'Perasaan' },
    { emoji: '🎬🍿😄', answer: 'nonton bioskop', hint: 'Hiburan' },
    { emoji: '🌅🏖️🌴', answer: 'liburan pantai', hint: 'Tempat' },
    { emoji: '🏋️💪🥊', answer: 'olahraga gym', hint: 'Aktivitas' },
    { emoji: '🎮🕹️👾', answer: 'main game', hint: 'Hiburan' },
    { emoji: '🌺💐👰', answer: 'pernikahan', hint: 'Acara' },
    { emoji: '🐟🎣🪣', answer: 'memancing ikan', hint: 'Aktivitas' },
    { emoji: '🌋💥🔥', answer: 'gunung meletus', hint: 'Bencana alam' },
    { emoji: '🚀🌙👨‍🚀', answer: 'perjalanan ke bulan', hint: 'Luar angkasa' },
    { emoji: '🍵📖🌧️', answer: 'baca buku sambil hujan', hint: 'Aktivitas santai' },
    { emoji: '🐝🌻🍯', answer: 'lebah madu', hint: 'Hewan & hasil' },
    { emoji: '🎭😂😢', answer: 'drama', hint: 'Pertunjukan' },
    { emoji: '🦷🪥😬', answer: 'sikat gigi', hint: 'Kegiatan' },
    { emoji: '🌈☀️🌦️', answer: 'setelah hujan', hint: 'Cuaca' },
    { emoji: '🐓⏰🌅', answer: 'ayam berkokok pagi', hint: 'Pagi hari' },
    { emoji: '🎯🏹🎪', answer: 'panahan', hint: 'Olahraga' },
    { emoji: '🔑🏠❤️', answer: 'rumah impian', hint: 'Impian' },
    { emoji: '🌴', answer: 'carmen', hint: 'Main Vocalist, asal Indonesia' },
    { emoji: '🍓', answer: 'jiwoo', hint: 'Leader, mantan balerina' },
    { emoji: '🎀', answer: 'yuha', hint: 'All-Rounder, jago piano' },
    { emoji: '🧁', answer: 'stella', hint: 'Vokalis, berdarah Korea-Kanada' },
    { emoji: '👾', answer: 'juun', hint: 'Main Rapper & Dancer' },
    { emoji: '🌻', answer: 'a-na', hint: 'Visual, energik, MC musik' },
    { emoji: '🫛', answer: 'ian', hint: 'Center, mood-maker' },
    { emoji: '😊', answer: 'ye-on', hint: 'Maknae, jago musikal' },
    { emoji: '🏃‍♀️💨🔍', answer: 'the chase', hint: 'Lagu debut mereka' },
    { emoji: '💅✨👠', answer: 'style', hint: 'Lagu ekspresif dan penuh percaya diri' },
    { emoji: '🚫😤💥', answer: 'rude', answer_id: 'RUDE!', hint: 'Lagu terbaru yang bold' },
    { emoji: '🎯👀🔥', answer: 'focus', hint: 'Title track dari mini album pertama' },
    { emoji: '🍭🎀✨', answer: 'pretty please', hint: 'Lagu kolaborasi/promo Pokémon' },
    { emoji: '🍎🥧👩‍🍳', answer: 'apple pie', hint: 'Lagu ceria tentang cinta manis' },
    { emoji: '💙🌙✨', answer: 'blue moon', hint: 'Lagu bergenre R&B ballad' },
    { emoji: '🦋✨🌸', answer: 'fultter', hint: 'Lagu bergenre City Pop' },
    { emoji: '🎯🧠🔗', answer: 'focus', hint: 'Title track dari album ini' }
]


// ================================
// CONFIG
// ================================
const TOTAL_SOAL = 10
const SOAL_DURATION = 60 * 1000
const MAX_WRONG = 3
const POINTS_CORRECT = 10
const POINTS_WRONG = -5

const normalize = text =>
    text
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')



const sessions = {}

function shuffle(arr) {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]]
    }
    return a
}

function formatRoundScore(roundScore) {
    const entries = Object.values(roundScore)
    if (entries.length === 0) return '😔 Tidak ada yang menjawab.'
    return entries
        .sort((a, b) => b.total - a.total)
        .map((p, i) => {
            const sign = p.total >= 0 ? '+' : ''
            return `${i + 1}. ${p.name}: *${sign}${p.total} poin*`
        })
        .join('\n')
}

async function nextSoal(sock, groupId) {
    const session = sessions[groupId]
    if (!session) return

    clearTimeout(session.timer)

    if (session.currentIndex >= TOTAL_SOAL) return endGame(sock, groupId)

    const soal = session.soalList[session.currentIndex]
    session.current = soal
    session.players = {}
    session.eliminated = []
    session.answered = false
    session.endTime = Date.now() + SOAL_DURATION

    session.timer = setTimeout(async () => {
        await sock.sendMessage(groupId, {
            text:
                `⏰ *Waktu habis soal ${session.currentIndex + 1}!*\n\n` +
                `🔑 Jawaban: *${soal.answer}*\n\n` +
                `⏳ Soal berikutnya dalam 3 detik...`
        })
        session.currentIndex++
        setTimeout(() => nextSoal(sock, groupId), 3000)
    }, SOAL_DURATION)

    const remaining = Math.ceil((session.endTime - Date.now()) / 1000)

   const sent = await sock.sendMessage(groupId, {
    text:
        `🎭 *TEBAK EMOJI — Soal ${session.currentIndex + 1}/${TOTAL_SOAL}*\n\n` +
        `${soal.emoji}\n\n` +
        `💡 Hint: *${soal.hint}*\n` +
        `⏳ Waktu: *${remaining} detik*\n\n` +
        `📌 Reply pesan ini untuk menjawab`
})

session.questionId = sent.key.id
}

async function endGame(sock, groupId) {
    const session = sessions[groupId]
    if (!session) return

    clearTimeout(session.timer)

    for (const [id, p] of Object.entries(session.roundScore)) {
        if (p.total !== 0) updatePoints(groupId, id, p.name, p.total)
    }

    const scoreText = formatRoundScore(session.roundScore)
    const top = Object.values(session.roundScore).sort((a, b) => b.total - a.total)[0]
    const winnerText = top && top.total > 0 ? `\n\n🏆 *Pemenang:* ${top.name} (+${top.total} poin)` : ''

    delete sessions[groupId]

    await sock.sendMessage(groupId, {
        text:
            `🎮 *GAME TEBAK EMOJI SELESAI!*\n` +
            `━━━━━━━━━━━━━━━━━━\n\n` +
            `📊 *Skor Ronde Ini:*\n` +
            scoreText +
            winnerText +
            `\n\n━━━━━━━━━━━━━━━━━━\n` +
            `📋 Ketik *!leaderboard* untuk peringkat\n` +
            `🎮 Ketik *!tebakemoji* untuk main lagi!`
    })
}

async function handleTebakEmoji(sock, msg, from, cmd, args, senderName) {
    const isGroup = from.endsWith('@g.us')

    if (cmd === 'tebakemoji') {
        if (!isGroup) return sock.sendMessage(from, { text: '❌ Game ini hanya bisa dimainkan di grup!' })

        if (sessions[from]) {
            const s = sessions[from]
            const remaining = Math.ceil((s.endTime - Date.now()) / 1000)
            return sock.sendMessage(from, {
                text:
                    `⚠️ Game sedang berlangsung!\n` +
                    `📝 Soal *${s.currentIndex + 1}/${TOTAL_SOAL}*\n` +
                    `⏳ Sisa waktu: *${remaining} detik*`
            })
        }

        const picked = shuffle(soalList).slice(0, TOTAL_SOAL)
        sessions[from] = {
            soalList: picked,
            currentIndex: 0,
            current: null,
            players: {},
            eliminated: [],
            roundScore: {},
            answered: false,
            endTime: 0,
            timer: null
        }

        await sock.sendMessage(from, {
            text:
                `🎭 *GAME TEBAK EMOJI DIMULAI!*\n` +
                `━━━━━━━━━━━━━━━━━━\n\n` +
                `📋 *${TOTAL_SOAL} soal* emoji menanti!\n` +
                `⏳ Waktu per soal: *1 menit*\n` +
                `✅ Benar: *+${POINTS_CORRECT} poin*\n` +
                `❌ Salah: *${POINTS_WRONG} poin*\n` +
                `💀 Salah *${MAX_WRONG}x*: tersingkir dari soal itu\n\n` +
                `📌 Reply pesan soal untuk menjawab.\n` +
                `━━━━━━━━━━━━━━━━━━\n` +
                `⏳ Soal pertama dalam 3 detik...`
        })

        setTimeout(() => nextSoal(sock, from), 3000)
        return
    }

    if (cmd === 'stoptebakemoji') {
        if (!sessions[from]) return sock.sendMessage(from, { text: '❌ Tidak ada game yang berjalan.' })
        clearTimeout(sessions[from].timer)
        delete sessions[from]
        return sock.sendMessage(from, { text: '🏳️ Game dihentikan.\n\nKetik *!tebakemoji* untuk main lagi!' })
    }
}

async function handleAyoTebakEmoji(sock, msg, from, body, senderName) {
    const senderId = msg.key.participant || msg.key.remoteJid
    const session = sessions[from]
    if (!session) return

    const quoted =
    msg.message?.extendedTextMessage?.contextInfo?.stanzaId

if (!quoted) return

if (quoted !== session.questionId) return

const guess = body.toLowerCase().trim()

    if (!guess) {
        return sock.sendMessage(from, {
            text: `⚠️ @${senderId.split('@')[0]} Tulis jawabannya!\nContoh: *ayo tebak emoji surfing*`,
            mentions: [senderId]
        })
    }

    if (!session.players[senderId]) {
        getPlayerData(from, senderId, senderName)
        session.players[senderId] = { name: senderName, wrongCount: 0 }
    }
    if (!session.roundScore[senderId]) {
        session.roundScore[senderId] = { name: senderName, total: 0 }
    }

    if (session.eliminated.includes(senderId)) {
        return sock.sendMessage(from, {
            text: `❌ @${senderId.split('@')[0]} Kamu tersingkir dari soal ini!`,
            mentions: [senderId]
        })
    }

    if (session.answered) {
        return sock.sendMessage(from, { text: `✅ Soal sudah terjawab! Tunggu soal berikutnya.` })
    }

    const player = session.players[senderId]
    const remaining = Math.ceil((session.endTime - Date.now()) / 1000)

    if (
    normalize(guess) ===
    normalize(session.current.answer)
) {
        session.answered = true
        session.roundScore[senderId].total += POINTS_CORRECT
        clearTimeout(session.timer)

        await sock.sendMessage(from, {
            text:
                `🎉 *BENAR!* @${senderId.split('@')[0]} berhasil menebak!\n\n` +
                `🔑 Jawaban: *${session.current.answer}*\n` +
                `⭐ +${POINTS_CORRECT} poin\n\n` +
                `⏳ Soal berikutnya dalam 3 detik...`,
            mentions: [senderId]
        })

        session.currentIndex++
        setTimeout(() => nextSoal(sock, from), 3000)
        return
    }

    player.wrongCount++
    session.roundScore[senderId].total += POINTS_WRONG
    const sisaKesempatan = MAX_WRONG - player.wrongCount

    if (sisaKesempatan <= 0) {
        session.eliminated.push(senderId)
        return sock.sendMessage(from, {
            text:
                `💀 @${senderId.split('@')[0]} *Tersingkir!* Sudah salah ${MAX_WRONG}x.\n` +
                `⏳ Sisa waktu: *${remaining} detik*`,
            mentions: [senderId]
        })
    }

    return sock.sendMessage(from, {
        text:
            `❌ @${senderId.split('@')[0]} Jawaban *${guess}* salah!\n` +
            `${POINTS_WRONG} poin\n` +
            `⚠️ Sisa kesempatan: *${sisaKesempatan}x*\n` +
            `⏳ Sisa waktu: *${remaining} detik*`,
        mentions: [senderId]
    })
}

module.exports = { handleTebakEmoji, handleAyoTebakEmoji }