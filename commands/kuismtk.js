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
// GENERATE SOAL MATEMATIKA
// ================================
function generateSoal() {
    const cerita = [
        {
            soal: 'Elyn memiliki 5 apel lalu membeli 3 apel lagi. Berapa jumlah apel Elyn sekarang?',
            jawaban: 8
        },
        {
            soal: 'Ucup memiliki 12 permen. Ia memberikan 4 permen kepada temannya. Berapa sisa permen Ucup?',
            jawaban: 8
        },
        {
            soal: 'Dalam satu kotak terdapat 6 pensil. Jika ada 4 kotak, berapa jumlah seluruh pensil?',
            jawaban: 24
        },
        {
            soal: 'Min Jiaa membeli 20 telur dan menggunakan 5 telur untuk membuat kue. Berapa telur yang tersisa?',
            jawaban: 15
        },
        {
            soal: 'Satu mobil memiliki 4 roda. Berapa jumlah roda dari 7 mobil?',
            jawaban: 28
        },
        {
            soal: 'Seekor ayam memiliki 2 kaki. Berapa jumlah kaki dari 15 ayam?',
            jawaban: 30
        },
        {
            soal: 'raisa  memiliki uang Rp50.000. Ia membeli buku seharga Rp15.000. Berapa sisa uang Rina?',
            jawaban: 35000
        },
        {
            soal: 'Dalam sebuah kelas terdapat 18 siswa laki-laki dan 17 siswa perempuan. Berapa jumlah seluruh siswa?',
            jawaban: 35
        },
        {
            soal: 'Sebuah bus membawa 40 penumpang. Di halte berikutnya 12 orang turun. Berapa penumpang yang tersisa?',
            jawaban: 28
        },
        {
            soal: 'Toko memiliki 8 rak. Setiap rak berisi 9 buku. Berapa jumlah seluruh buku?',
            jawaban: 72
        }
    ]

    // peluang soal cerita lebih besar
    const ops = ['+', '-', 'x', ':', 'cerita', 'cerita', 'cerita']
    const op = ops[Math.floor(Math.random() * ops.length)]

    let a, b, answer, soalText

    switch (op) {
        case '+':
            a = Math.floor(Math.random() * 100) + 1
            b = Math.floor(Math.random() * 100) + 1
            answer = a + b
            soalText = `${a} + ${b}`
            break

        case '-':
            a = Math.floor(Math.random() * 100) + 50
            b = Math.floor(Math.random() * 50) + 1
            answer = a - b
            soalText = `${a} - ${b}`
            break

        case 'x':
            a = Math.floor(Math.random() * 20) + 1
            b = Math.floor(Math.random() * 20) + 1
            answer = a * b
            soalText = `${a} x ${b}`
            break

        case ':':
            b = Math.floor(Math.random() * 19) + 2
            answer = Math.floor(Math.random() * 20) + 1
            a = b * answer
            soalText = `${a} : ${b}`
            break

        case 'cerita':
            const randomCerita =
                cerita[Math.floor(Math.random() * cerita.length)]

            answer = randomCerita.jawaban
            soalText = randomCerita.soal
            break
    }

    return {
        soalText,
        answer: answer.toString()
    }
}

// ================================
// CONFIG
// ================================
const TOTAL_SOAL = 10
const SOAL_DURATION = 30 * 1000  // 30 detik per soal (matematika lebih cepat)
const POINTS_CORRECT = 10
const POINTS_WRONG = -3

const sessions = {}

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

    const soal = generateSoal()
    session.current = soal
    session.answered = false
    session.answeredBy = []   // siapa saja yang sudah jawab di soal ini
    session.endTime = Date.now() + SOAL_DURATION

    session.timer = setTimeout(async () => {
        await sock.sendMessage(groupId, {
            text:
                `⏰ *Waktu habis soal ${session.currentIndex + 1}!*\n\n` +
                `🔑 Jawaban: *${soal.answer}*\n\n` +
                `⏳ Soal berikutnya dalam 2 detik...`
        })
        session.currentIndex++
        setTimeout(() => nextSoal(sock, groupId), 2000)
    }, SOAL_DURATION)

    await sock.sendMessage(groupId, {
        text:
            `🔢 *KUIS MATEMATIKA — Soal ${session.currentIndex + 1}/${TOTAL_SOAL}*\n\n` +
            `❓ *${soal.soalText} = ?*\n\n` +
            `⏳ Waktu: *30 detik*\n\n` +
            `Ketik *jawab angka* untuk menjawab!\n` +
            `Contoh: *jawab 42*`
    })
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
            `🎮 *KUIS MATEMATIKA SELESAI!*\n` +
            `━━━━━━━━━━━━━━━━━━\n\n` +
            `📊 *Skor Ronde Ini:*\n` +
            scoreText +
            winnerText +
            `\n\n━━━━━━━━━━━━━━━━━━\n` +
            `📋 Ketik *!leaderboard* untuk peringkat\n` +
            `🎮 Ketik *!kuis* untuk main lagi!`
    })
}

async function handleKuis(sock, msg, from, cmd, args, senderName) {
    const isGroup = from.endsWith('@g.us')

    if (cmd === 'kuis') {
        if (!isGroup) return sock.sendMessage(from, { text: '❌ Game ini hanya bisa dimainkan di grup!' })

        if (sessions[from]) {
            const s = sessions[from]
            const remaining = Math.ceil((s.endTime - Date.now()) / 1000)
            return sock.sendMessage(from, {
                text:
                    `⚠️ Kuis sedang berlangsung!\n` +
                    `📝 Soal *${s.currentIndex + 1}/${TOTAL_SOAL}*\n` +
                    `❓ *${s.current.soalText} = ?*\n` +
                    `⏳ Sisa waktu: *${remaining} detik*`
            })
        }

        sessions[from] = {
            currentIndex: 0,
            current: null,
            answered: false,
            answeredBy: [],
            roundScore: {},
            endTime: 0,
            timer: null
        }

        await sock.sendMessage(from, {
            text:
                `🔢 *KUIS MATEMATIKA DIMULAI!*\n` +
                `━━━━━━━━━━━━━━━━━━\n\n` +
                `📋 *${TOTAL_SOAL} soal* matematika cepat!\n` +
                `⏳ Waktu per soal: *30 detik*\n` +
                `✅ Benar: *+${POINTS_CORRECT} poin*\n` +
                `❌ Salah: *${POINTS_WRONG} poin*\n` +
                `⚡ Siapa cepat dia dapat poin!\n\n` +
                `Ketik *jawab angka* untuk menjawab!\n` +
                `━━━━━━━━━━━━━━━━━━\n` +
                `⏳ Soal pertama dalam 3 detik...`
        })

        setTimeout(() => nextSoal(sock, from), 3000)
        return
    }

    if (cmd === 'stopkuis') {
        if (!sessions[from]) return sock.sendMessage(from, { text: '❌ Tidak ada kuis yang berjalan.' })
        clearTimeout(sessions[from].timer)
        delete sessions[from]
        return sock.sendMessage(from, { text: '🏳️ Kuis dihentikan.\n\nKetik *!kuis* untuk main lagi!' })
    }
}

// ================================
// HANDLER "jawab"
// ================================
async function handleJawabKuis(sock, msg, from, body, senderName) {
    const senderId = msg.key.participant || msg.key.remoteJid
    const session = sessions[from]
    if (!session) return

    const lowerBody = body.toLowerCase().trim()
    if (!lowerBody.startsWith('jawab ')) return

    const guess = lowerBody.replace('jawab', '').replace(/[<>]/g, '').trim()

    if (!guess) return

    if (!session.roundScore[senderId]) {
        getPlayerData(from, senderId, senderName)
        session.roundScore[senderId] = { name: senderName, total: 0 }
    }

    if (session.answered) {
        return sock.sendMessage(from, { text: `✅ Soal sudah terjawab! Tunggu soal berikutnya.` })
    }

    // cek apakah sudah pernah jawab soal ini
    if (session.answeredBy.includes(senderId)) {
        return sock.sendMessage(from, {
            text: `⚠️ @${senderId.split('@')[0]} Kamu sudah menjawab soal ini!`,
            mentions: [senderId]
        })
    }

    session.answeredBy.push(senderId)
    const remaining = Math.ceil((session.endTime - Date.now()) / 1000)

    if (guess === session.current.answer) {
        session.answered = true
        session.roundScore[senderId].total += POINTS_CORRECT
        clearTimeout(session.timer)

        await sock.sendMessage(from, {
            text:
                `⚡ *BENAR!* @${senderId.split('@')[0]} paling cepat!\n\n` +
                `❓ ${session.current.soalText} = *${session.current.answer}*\n` +
                `⭐ +${POINTS_CORRECT} poin\n\n` +
                `⏳ Soal berikutnya dalam 2 detik...`,
            mentions: [senderId]
        })

        session.currentIndex++
        setTimeout(() => nextSoal(sock, from), 2000)
        return
    }

    session.roundScore[senderId].total += POINTS_WRONG

    return sock.sendMessage(from, {
        text:
            `❌ @${senderId.split('@')[0]} Jawaban *${guess}* salah!\n` +
            `${POINTS_WRONG} poin\n` +
            `⏳ Sisa waktu: *${remaining} detik*`,
        mentions: [senderId]
    })
}

module.exports = { handleKuis, handleJawabKuis }