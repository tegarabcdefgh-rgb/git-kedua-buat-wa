const fs = require('fs')
const path = require('path')

// ================================
// DATA PERSISTENCE (shared dengan leaderboard utama)
// ================================
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

function getLeaderboard(groupId) {
    const data = loadData()
    if (!data[groupId]) return []
    return Object.entries(data[groupId])
        .map(([id, v]) => ({ id, name: v.name, points: v.points }))
        .sort((a, b) => b.points - a.points)
}

// ================================
// SOAL LIST
// ================================
const soalList = [
    {
        clues: ['Aku hidup di hutan bambu', 'Aku hewan dari China', 'Aku hitam putih dan lucu'],
        answer: 'panda', category: 'Hewan 🐾'
    },
    {
        clues: ['Aku adalah penemu bola lampu', 'Aku punya lebih dari 1000 paten', 'Namaku Thomas Alva...'],
        answer: 'edison', category: 'Tokoh 👤'
    },
    {
        clues: ['Aku planet terbesar di tata surya', 'Aku punya cincin indah', 'Aku planet ke-6 dari matahari'],
        answer: 'saturnus', category: 'Luar Angkasa 🪐'
    },
    {
        clues: ['Aku buah tropis berduri', 'Bauku sangat menyengat', 'Orang menyebutku raja buah'],
        answer: 'durian', category: 'Buah 🍈'
    },
    {
        clues: ['Aku dibangun di Mesir', 'Aku terbuat dari batu besar', 'Bentukku segitiga raksasa'],
        answer: 'piramida', category: 'Tempat 🗺️'
    },
    {
        clues: ['Aku hewan terbesar di lautan', 'Aku mamalia bukan ikan', 'Aku bisa mengeluarkan suara nyanyian'],
        answer: 'paus', category: 'Hewan 🐾'
    },
    {
        clues: ['Aku penemu teori relativitas', 'Aku ilmuwan fisika terkenal', 'Namaku Albert...'],
        answer: 'einstein', category: 'Tokoh 👤'
    },
    {
        clues: ['Aku negara terluas di dunia', 'Ibu kotaku Moskow', 'Aku membentang dari Eropa ke Asia'],
        answer: 'rusia', category: 'Negara 🌍'
    },
    {
        clues: ['Aku makanan khas Jepang', 'Aku nasi digulung dengan rumput laut', 'Aku sering diisi ikan mentah'],
        answer: 'sushi', category: 'Makanan 🍱'
    },
    {
        clues: ['Aku senjata tradisional Indonesia', 'Bentukku berkelok-kelok', 'Aku sering dianggap pusaka sakral'],
        answer: 'keris', category: 'Budaya 🏛️'
    },
    {
        clues: ['Aku olahraga air', 'Aku menggunakan papan panjang', 'Aku menunggangi ombak besar'],
        answer: 'surfing', category: 'Olahraga 🏄'
    },
    {
        clues: ['Aku tokoh kartun terkenal', 'Aku tikus yang suka keju', 'Aku milik Walt Disney'],
        answer: 'mickey', category: 'Kartun 🎨'
    },
    {
        clues: ['Aku alat musik tiup', 'Aku terbuat dari kulit binatang', 'Aku dimainkan dengan dipukul'],
        answer: 'gendang', category: 'Musik 🎵'
    },
    {
        clues: ['Aku hewan yang bisa berubah warna', 'Aku reptil pemakan serangga', 'Mataku bisa bergerak sendiri-sendiri'],
        answer: 'bunglon', category: 'Hewan 🐾'
    },
    {
        clues: ['Aku ibu kota Indonesia', 'Aku kota metropolitan terbesar di Indonesia', 'Aku terletak di pulau Jawa'],
        answer: 'jakarta', category: 'Kota 🏙️'
    },
    {
        clues: ['Aku planet merah', 'Aku planet ke-4 dari matahari', 'Ilmuwan ingin mengirim manusia ke sini'],
        answer: 'mars', category: 'Luar Angkasa 🪐'
    },
    {
        clues: ['Aku tarian tradisional Bali', 'Aku menggambarkan kisah Ramayana', 'Gerakanku menggunakan seluruh tubuh'],
        answer: 'kecak', category: 'Budaya 🏛️'
    },
    {
        clues: ['Aku superhero berkostum merah biru', 'Aku bisa menembak jaring', 'Aku menggantung di gedung tinggi'],
        answer: 'spiderman', category: 'Fiksi 🦸'
    },
    {
        clues: ['Aku danau terluas di Indonesia', 'Aku berada di Sumatera Utara', 'Di tengahku ada sebuah pulau'],
        answer: 'toba', category: 'Tempat 🗺️'
    },
    {
        clues: ['Aku buah kecil merah', 'Aku sering dibuat selai', 'Aku tumbuh di daerah dingin'],
        answer: 'stroberi', category: 'Buah 🍓'
    },
    {
        clues: ['Aku presiden pertama Indonesia', 'Aku proklamator kemerdekaan', 'Namaku satu kata saja'],
        answer: 'soekarno', category: 'Tokoh 👤'
    },
    {
        clues: ['Aku makanan fermentasi Korea', 'Aku terbuat dari sayuran', 'Rasaku asam dan pedas'],
        answer: 'kimchi', category: 'Makanan 🍱'
    },
    {
        clues: ['Aku hewan berbisa', 'Aku merayap tanpa kaki', 'Lidahku bercabang dua'],
        answer: 'ular', category: 'Hewan 🐾'
    },
    {
        clues: ['Aku gunung tertinggi di dunia', 'Aku berada di pegunungan Himalaya', 'Tingginya 8848 meter'],
        answer: 'everest', category: 'Tempat 🗺️'
    },
    {
        clues: ['Aku alat komunikasi genggam', 'Aku bisa untuk telepon dan internet', 'Hampir semua orang punya aku'],
        answer: 'handphone', category: 'Teknologi 📱'
    },
]

// ================================
// CONFIG
// ================================
const TOTAL_SOAL = 10
const SOAL_DURATION = 60 * 1000
const MAX_WRONG = 3
const POINTS_CORRECT = 15
const POINTS_WRONG = -5

// ================================
// SESSION
// ================================
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

// ================================
// NEXT SOAL
// ================================
async function nextSoal(sock, groupId) {
    const session = sessions[groupId]
    if (!session) return

    clearTimeout(session.timer)

    if (session.currentIndex >= TOTAL_SOAL) {
        return endGame(sock, groupId)
    }

    const soal = session.soalList[session.currentIndex]
    session.current = soal
    session.players = {}
    session.eliminated = []
    session.answered = false
    session.clueIndex = 0
    session.endTime = Date.now() + SOAL_DURATION

    // kirim clue pertama dulu
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

    // kirim clue bertahap tiap 15 detik
    await sendClue(sock, groupId, 0)
    session.clueTimers = [
        setTimeout(() => sendClue(sock, groupId, 1), 15000),
        setTimeout(() => sendClue(sock, groupId, 2), 30000),
    ]
}

async function sendClue(sock, groupId, clueIdx) {
    const session = sessions[groupId]
    if (!session || session.answered) return

    const soal = session.current
    const remaining = Math.ceil((session.endTime - Date.now()) / 1000)

    let text =
        `🕵️ *SIAPA AKU? — Soal ${session.currentIndex + 1}/${TOTAL_SOAL}*\n` +
        `📂 Kategori: *${soal.category}*\n\n`

    for (let i = 0; i <= clueIdx; i++) {
        text += `💡 Clue ${i + 1}: ${soal.clues[i]}\n`
    }

    text +=
        `\n⏳ Sisa waktu: *${remaining} detik*\n` +
        `Ketik *ayo tebak siapa jawaban* untuk menebak!`

    await sock.sendMessage(groupId, { text })
}

// ================================
// END GAME
// ================================
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
            `🎮 *GAME SIAPA AKU SELESAI!*\n` +
            `━━━━━━━━━━━━━━━━━━\n\n` +
            `📊 *Skor Ronde Ini:*\n` +
            scoreText +
            winnerText +
            `\n\n━━━━━━━━━━━━━━━━━━\n` +
            `📋 Ketik *!leaderboard* untuk peringkat\n` +
            `🎮 Ketik *!siapaaaku* untuk main lagi!`
    })
}

// ================================
// MAIN HANDLER
// ================================
async function handleSiapaAku(sock, msg, from, cmd, args, senderName) {
    const isGroup = from.endsWith('@g.us')

    if (cmd === 'siapaaku') {
        if (!isGroup) return sock.sendMessage(from, { text: '❌ Game ini hanya bisa dimainkan di grup!' })

        if (sessions[from]) {
            const s = sessions[from]
            const remaining = Math.ceil((s.endTime - Date.now()) / 1000)
            return sock.sendMessage(from, {
                text:
                    `⚠️ Game sedang berlangsung!\n` +
                    `📝 Soal *${s.currentIndex + 1}/${TOTAL_SOAL}*\n` +
                    `⏳ Sisa waktu: *${remaining} detik*\n\n` +
                    `Ketik *ayo tebak siapa jawaban* untuk ikut!`
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
            timer: null,
            clueTimers: []
        }

        await sock.sendMessage(from, {
            text:
                `🕵️ *GAME SIAPA AKU DIMULAI!*\n` +
                `━━━━━━━━━━━━━━━━━━\n\n` +
                `📋 *${TOTAL_SOAL} soal* dengan 3 clue bertahap\n` +
                `⏳ Waktu per soal: *1 menit*\n` +
                `✅ Jawaban benar: *+${POINTS_CORRECT} poin*\n` +
                `❌ Jawaban salah: *${POINTS_WRONG} poin*\n` +
                `💀 Salah *${MAX_WRONG}x*: tersingkir dari soal itu\n\n` +
                `Ketik *ayo tebak siapa jawaban* untuk menebak!\n` +
                `━━━━━━━━━━━━━━━━━━\n` +
                `⏳ Soal pertama dalam 3 detik...`
        })

        setTimeout(() => nextSoal(sock, from), 3000)
        return
    }

    if (cmd === 'stopsiapaaku') {
        if (!sessions[from]) return sock.sendMessage(from, { text: '❌ Tidak ada game yang berjalan.' })
        clearTimeout(sessions[from].timer)
        sessions[from].clueTimers?.forEach(t => clearTimeout(t))
        delete sessions[from]
        return sock.sendMessage(from, { text: '🏳️ Game dihentikan.\n\nKetik *!siapaaku* untuk main lagi!' })
    }
}

// ================================
// HANDLER "ayo tebak siapa"
// ================================
async function handleAyoTebakSiapa(sock, msg, from, body, senderName) {
    const senderId = msg.key.participant || msg.key.remoteJid
    const session = sessions[from]
    if (!session) return

    const lowerBody = body.toLowerCase().trim()
    if (!lowerBody.startsWith('ayo tebak siapa')) return

    const guess = lowerBody.replace('ayo tebak siapa', '').replace(/[<>]/g, '').trim()

    if (!guess) {
        return sock.sendMessage(from, {
            text: `⚠️ @${senderId.split('@')[0]} Tulis jawabannya!\nContoh: *ayo tebak siapa panda*`,
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

    if (guess === session.current.answer) {
        session.answered = true
        session.roundScore[senderId].total += POINTS_CORRECT
        session.clueTimers?.forEach(t => clearTimeout(t))
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

module.exports = { handleSiapaAku, handleAyoTebakSiapa }