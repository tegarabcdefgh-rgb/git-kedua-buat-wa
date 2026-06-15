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
// CONFIG TINGKAT KESULITAN
// ================================
const DIFFICULTY = {
    mudah: {
        label: '🟢 MUDAH',
        emoji: '🟢',
        pointsCorrect: 10,
        pointsWrong: -3,
        duration: 30 * 1000,
    },
    menengah: {
        label: '🟡 MENENGAH',
        emoji: '🟡',
        pointsCorrect: 15,
        pointsWrong: -5,
        duration: 25 * 1000,
    },
    sulit: {
        label: '🔴 SULIT',
        emoji: '🔴',
        pointsCorrect: 25,
        pointsWrong: -10,
        duration: 20 * 1000,
    },
}

const TOTAL_SOAL = 10

// ================================
// GENERATE SOAL BERDASARKAN LEVEL
// ================================
function generateSoal(level = 'mudah') {

    // ── Soal Cerita ────────────────────────────────────────────────
    const soalCeritaMudah = [
        { soal: 'Elyn memiliki 5 apel lalu membeli 3 apel lagi. Berapa jumlah apel Elyn sekarang?', jawaban: 8 },
        { soal: 'Ucup memiliki 12 permen. Ia memberikan 4 permen kepada temannya. Berapa sisa permen Ucup?', jawaban: 8 },
        { soal: 'Dalam satu kotak terdapat 6 pensil. Jika ada 4 kotak, berapa jumlah seluruh pensil?', jawaban: 24 },
        { soal: 'Min Jiaa membeli 20 telur dan menggunakan 5 telur untuk membuat kue. Berapa telur yang tersisa?', jawaban: 15 },
        { soal: 'Satu mobil memiliki 4 roda. Berapa jumlah roda dari 7 mobil?', jawaban: 28 },
        { soal: 'Seekor ayam memiliki 2 kaki. Berapa jumlah kaki dari 15 ayam?', jawaban: 30 },
        { soal: 'Raisa memiliki uang Rp50.000. Ia membeli buku seharga Rp15.000. Berapa sisa uang Raisa?', jawaban: 35000 },
        { soal: 'Dalam sebuah kelas terdapat 18 siswa laki-laki dan 17 siswa perempuan. Berapa jumlah seluruh siswa?', jawaban: 35 },
        { soal: 'Sebuah bus membawa 40 penumpang. Di halte berikutnya 12 orang turun. Berapa penumpang yang tersisa?', jawaban: 28 },
        { soal: 'Toko memiliki 8 rak. Setiap rak berisi 9 buku. Berapa jumlah seluruh buku?', jawaban: 72 },
    ]

    const soalCeritaMenengah = [
        { soal: 'Sebuah toko menjual 3 lusin pensil. Berapa jumlah pensil yang terjual?', jawaban: 36 },
        { soal: 'Pak Budi memiliki kebun seluas 120 m². Ia membagi rata menjadi 8 petak. Berapa luas tiap petak?', jawaban: 15 },
        { soal: 'Harga 5 buku adalah Rp75.000. Berapa harga 1 buku?', jawaban: 15000 },
        { soal: 'Jarak rumah ke sekolah 2,5 km. Jika ditempuh 5 hari, berapa total jarak yang ditempuh (pulang-pergi)?', jawaban: 25 },
        { soal: 'Sebuah persegi panjang panjangnya 14 cm dan lebarnya 8 cm. Berapa kelilingnya?', jawaban: 44 },
        { soal: 'Dari 200 siswa, 45% adalah laki-laki. Berapa jumlah siswa laki-laki?', jawaban: 90 },
        { soal: 'Sebuah tangki berisi 300 liter air. Setiap jam berkurang 25 liter. Berapa liter setelah 6 jam?', jawaban: 150 },
        { soal: 'Kecepatan rata-rata sepeda 15 km/jam. Berapa jarak yang ditempuh dalam 2,5 jam?', jawaban: 37 },
        { soal: 'Sebuah persegi memiliki sisi 13 cm. Berapa luas perseginya?', jawaban: 169 },
        { soal: 'Sebuah toko membeli barang seharga Rp80.000 dan dijual Rp100.000. Berapa keuntungannya?', jawaban: 20000 },
    ]

    const soalCeritaSulit = [
        { soal: 'Sebuah kereta berangkat pukul 07.30 dengan kecepatan 80 km/jam. Pukul berapa kereta tiba di tujuan yang berjarak 200 km? (Jawab dalam menit sejak 07.30)', jawaban: 150 },
        { soal: 'Akar kuadrat dari 5.329 adalah...', jawaban: 73 },
        { soal: 'Sebuah tabung memiliki jari-jari 7 cm dan tinggi 10 cm. Berapa volumenya? (π=22/7)', jawaban: 1540 },
        { soal: '25% dari 3/4 dari 480 adalah...', jawaban: 90 },
        { soal: 'Jika 3x + 7 = 28, berapa nilai x?', jawaban: 7 },
        { soal: 'Sebuah toko memberi diskon 20% lalu diskon lagi 10%. Jika harga awal Rp500.000, berapa harga akhir?', jawaban: 360000 },
        { soal: 'FPB dari 84 dan 120 adalah...', jawaban: 12 },
        { soal: 'KPK dari 12, 15, dan 20 adalah...', jawaban: 60 },
        { soal: 'Sebuah segitiga siku-siku memiliki sisi 6 cm dan 8 cm. Berapa panjang sisi miringnya?', jawaban: 10 },
        { soal: 'Rata-rata dari 7, 12, 15, 9, 17 adalah...', jawaban: 12 },
    ]

    let a, b, answer, soalText

    if (level === 'mudah') {
        const ops = ['+', '-', 'x', ':', 'cerita', 'cerita', 'cerita']
        const op = ops[Math.floor(Math.random() * ops.length)]

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
                a = Math.floor(Math.random() * 12) + 1
                b = Math.floor(Math.random() * 12) + 1
                answer = a * b
                soalText = `${a} x ${b}`
                break
            case ':':
                b = Math.floor(Math.random() * 9) + 2
                answer = Math.floor(Math.random() * 10) + 1
                a = b * answer
                soalText = `${a} : ${b}`
                break
            case 'cerita':
                const c = soalCeritaMudah[Math.floor(Math.random() * soalCeritaMudah.length)]
                answer = c.jawaban
                soalText = c.soal
                break
        }

    } else if (level === 'menengah') {
        const ops = ['+', '-', 'x', ':', 'cerita', 'cerita']
        const op = ops[Math.floor(Math.random() * ops.length)]

        switch (op) {
            case '+':
                a = Math.floor(Math.random() * 500) + 100
                b = Math.floor(Math.random() * 500) + 100
                answer = a + b
                soalText = `${a} + ${b}`
                break
            case '-':
                a = Math.floor(Math.random() * 500) + 300
                b = Math.floor(Math.random() * 300) + 1
                answer = a - b
                soalText = `${a} - ${b}`
                break
            case 'x':
                a = Math.floor(Math.random() * 30) + 10
                b = Math.floor(Math.random() * 20) + 5
                answer = a * b
                soalText = `${a} x ${b}`
                break
            case ':':
                b = Math.floor(Math.random() * 19) + 2
                answer = Math.floor(Math.random() * 30) + 5
                a = b * answer
                soalText = `${a} : ${b}`
                break
            case 'cerita':
                const c = soalCeritaMenengah[Math.floor(Math.random() * soalCeritaMenengah.length)]
                answer = c.jawaban
                soalText = c.soal
                break
        }

    } else if (level === 'sulit') {
        const ops = ['x', ':', 'pangkat', 'campuran', 'cerita', 'cerita']
        const op = ops[Math.floor(Math.random() * ops.length)]

        switch (op) {
            case 'x':
                a = Math.floor(Math.random() * 90) + 10
                b = Math.floor(Math.random() * 90) + 10
                answer = a * b
                soalText = `${a} x ${b}`
                break
            case ':':
                b = Math.floor(Math.random() * 49) + 2
                answer = Math.floor(Math.random() * 50) + 10
                a = b * answer
                soalText = `${a} : ${b}`
                break
            case 'pangkat':
                a = Math.floor(Math.random() * 15) + 5
                answer = a * a
                soalText = `${a}²`
                break
            case 'campuran':
                a = Math.floor(Math.random() * 50) + 10
                b = Math.floor(Math.random() * 20) + 2
                const c2 = Math.floor(Math.random() * 10) + 1
                answer = (a + b) * c2
                soalText = `(${a} + ${b}) x ${c2}`
                break
            case 'cerita':
                const cs = soalCeritaSulit[Math.floor(Math.random() * soalCeritaSulit.length)]
                answer = cs.jawaban
                soalText = cs.soal
                break
        }
    }

    return { soalText, answer: answer.toString() }
}

// ================================
// SESSION & HELPERS
// ================================
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

    const diff   = DIFFICULTY[session.level]
    const soal   = generateSoal(session.level)
    session.current    = soal
    session.answered   = false
    session.answeredBy = []
    session.endTime    = Date.now() + diff.duration

    const detikPerSoal = diff.duration / 1000

    session.timer = setTimeout(async () => {
        await sock.sendMessage(groupId, {
            text:
                `⏰ *Waktu habis soal ${session.currentIndex + 1}!*\n\n` +
                `🔑 Jawaban: *${soal.answer}*\n\n` +
                `⏳ Soal berikutnya dalam 2 detik...`
        })
        session.currentIndex++
        setTimeout(() => nextSoal(sock, groupId), 2000)
    }, diff.duration)

    await sock.sendMessage(groupId, {
        text:
            `🔢 *KUIS MTK ${diff.label} — Soal ${session.currentIndex + 1}/${TOTAL_SOAL}*\n\n` +
            `❓ *${soal.soalText} = ?*\n\n` +
            `⏳ Waktu: *${detikPerSoal} detik*\n` +
            `✅ Benar: *+${diff.pointsCorrect} poin* | ❌ Salah: *${diff.pointsWrong} poin*\n\n` +
            `Ketik *jawab angka* untuk menjawab!`
    })
}

async function endGame(sock, groupId) {
    const session = sessions[groupId]
    if (!session) return

    clearTimeout(session.timer)

    for (const [id, p] of Object.entries(session.roundScore)) {
        if (p.total !== 0) updatePoints(groupId, id, p.name, p.total)
    }

    const scoreText  = formatRoundScore(session.roundScore)
    const top        = Object.values(session.roundScore).sort((a, b) => b.total - a.total)[0]
    const winnerText = top && top.total > 0 ? `\n\n🏆 *Pemenang:* ${top.name} (+${top.total} poin)` : ''
    const diff       = DIFFICULTY[session.level]

    delete sessions[groupId]

    await sock.sendMessage(groupId, {
        text:
            `🎮 *KUIS MATEMATIKA SELESAI!*\n` +
            `${diff.label}\n` +
            `━━━━━━━━━━━━━━━━━━\n\n` +
            `📊 *Skor Ronde Ini:*\n` +
            scoreText +
            winnerText +
            `\n\n━━━━━━━━━━━━━━━━━━\n` +
            `📋 Ketik *!leaderboard* untuk peringkat\n` +
            `🎮 Ketik *!kuis* untuk main lagi!`
    })
}

// ================================
// HANDLER KUIS
// ================================
async function handleKuis(sock, msg, from, cmd, args, senderName) {
    const isGroup = from.endsWith('@g.us')

    if (cmd === 'kuis') {
        if (!isGroup) return sock.sendMessage(from, { text: '❌ Game ini hanya bisa dimainkan di grup!' })

        if (sessions[from]) {
            const s = sessions[from]
            const diff = DIFFICULTY[s.level]
            const remaining = Math.ceil((s.endTime - Date.now()) / 1000)
            return sock.sendMessage(from, {
                text:
                    `⚠️ Kuis ${diff.label} sedang berlangsung!\n` +
                    `📝 Soal *${s.currentIndex + 1}/${TOTAL_SOAL}*\n` +
                    `❓ *${s.current.soalText} = ?*\n` +
                    `⏳ Sisa waktu: *${remaining} detik*`
            })
        }

        // Tentukan level dari argumen
        const levelArg = args[0]?.toLowerCase()
        const level = ['mudah', 'menengah', 'sulit'].includes(levelArg) ? levelArg : null

        if (!level) {
            return sock.sendMessage(from, {
                text:
                    `🔢 *KUIS MATEMATIKA*\n` +
                    `━━━━━━━━━━━━━━━━━━\n\n` +
                    `Pilih tingkat kesulitan:\n\n` +
                    `🟢 *!kuis mudah* — Soal dasar, salah *-3 poin*\n` +
                    `🟡 *!kuis menengah* — Soal sedang, salah *-5 poin*\n` +
                    `🔴 *!kuis sulit* — Soal kompleks, salah *-10 poin*\n\n` +
                    `Semakin sulit, poin benar juga semakin besar!`
            })
        }

        const diff = DIFFICULTY[level]

        sessions[from] = {
            level,
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
                `${diff.label}\n` +
                `━━━━━━━━━━━━━━━━━━\n\n` +
                `📋 *${TOTAL_SOAL} soal* matematika!\n` +
                `⏳ Waktu per soal: *${diff.duration / 1000} detik*\n` +
                `✅ Benar: *+${diff.pointsCorrect} poin*\n` +
                `❌ Salah: *${diff.pointsWrong} poin*\n` +
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
    const session  = sessions[from]
    if (!session) return

    const lowerBody = body.toLowerCase().trim()
    if (!lowerBody.startsWith('jawab ')) return

    const guess = lowerBody.replace('jawab', '').replace(/[<>]/g, '').trim()
    if (!guess) return

    const diff = DIFFICULTY[session.level]

    if (!session.roundScore[senderId]) {
        getPlayerData(from, senderId, senderName)
        session.roundScore[senderId] = { name: senderName, total: 0 }
    }

    if (session.answered) {
        return sock.sendMessage(from, { text: `✅ Soal sudah terjawab! Tunggu soal berikutnya.` })
    }

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
        session.roundScore[senderId].total += diff.pointsCorrect
        clearTimeout(session.timer)

        await sock.sendMessage(from, {
            text:
                `⚡ *BENAR!* @${senderId.split('@')[0]} paling cepat!\n\n` +
                `❓ ${session.current.soalText} = *${session.current.answer}*\n` +
                `⭐ +${diff.pointsCorrect} poin\n\n` +
                `⏳ Soal berikutnya dalam 2 detik...`,
            mentions: [senderId]
        })

        session.currentIndex++
        setTimeout(() => nextSoal(sock, from), 2000)
        return
    }

    session.roundScore[senderId].total += diff.pointsWrong

    return sock.sendMessage(from, {
        text:
            `❌ @${senderId.split('@')[0]} Jawaban *${guess}* salah!\n` +
            `${diff.pointsWrong} poin\n` +
            `⏳ Sisa waktu: *${remaining} detik*`,
        mentions: [senderId]
    })
}

module.exports = { handleKuis, handleJawabKuis }