const fs = require('fs')
const path = require('path')

// ================================
// DATA PERSISTENCE
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
// WORD LIST
// ================================
const words = [
    { word: 'kucing', hint: 'Hewan peliharaan yang suka mengeong 🐱' },
    { word: 'matahari', hint: 'Bintang yang menyinari bumi setiap hari ☀️' },
    { word: 'gitar', hint: 'Alat musik petik yang populer di seluruh dunia 🎸' },
    { word: 'pizza', hint: 'Makanan Italia dengan topping keju dan saus tomat 🍕' },
    { word: 'hujan', hint: 'Air yang jatuh dari langit saat mendung 🌧️' },
    { word: 'buku', hint: 'Tempat menyimpan ilmu, terbuat dari kertas 📚' },
    { word: 'bulan', hint: 'Benda langit yang bersinar di malam hari 🌙' },
    { word: 'nasi', hint: 'Makanan pokok orang Indonesia 🍚' },
    { word: 'sepeda', hint: 'Kendaraan roda dua yang digerakkan kaki 🚲' },
    { word: 'komputer', hint: 'Mesin pintar untuk bekerja dan hiburan 💻' },
    { word: 'pohon', hint: 'Tumbuhan besar penghasil oksigen 🌳' },
    { word: 'ikan', hint: 'Hewan yang hidup di air dan bisa dimakan 🐟' },
    { word: 'api', hint: 'Panas dan cahaya hasil pembakaran 🔥' },
    { word: 'angin', hint: 'Udara yang bergerak dan terasa di kulit 💨' },
    { word: 'rumah', hint: 'Tempat tinggal dan berlindung dari cuaca 🏠' },
    { word: 'kelapa', hint: 'Buah tropis dengan air segar di dalamnya 🥥' },
    { word: 'burung', hint: 'Hewan bersayap yang bisa terbang 🐦' },
    { word: 'laut', hint: 'Perairan luas asin tempat ikan hidup 🌊' },
    { word: 'gunung', hint: 'Daratan tinggi yang menjulang ke langit 🏔️' },
    { word: 'bintang', hint: 'Titik cahaya kecil yang tampak di malam hari ⭐' },
    { word: 'jeruk', hint: 'Buah bulat berwarna oranye yang asam manis 🍊' },
    { word: 'apel', hint: 'Buah merah atau hijau yang renyah 🍎' },
    { word: 'pisang', hint: 'Buah kuning panjang favorit monyet 🍌' },
    { word: 'naga', hint: 'Makhluk mitologi yang bisa menyemburkan api 🐉' },
    { word: 'harimau', hint: 'Kucing besar bergaris belang yang ganas 🐯' },
    { word: 'gajah', hint: 'Hewan darat terbesar dengan belalai panjang 🐘' },
    { word: 'jerapah', hint: 'Hewan leher panjang tertinggi di dunia 🦒' },
    { word: 'zebra', hint: 'Kuda bergaris hitam putih dari Afrika 🦓' },
    { word: 'kamera', hint: 'Alat untuk mengabadikan foto dan video 📷' },
    { word: 'payung', hint: 'Pelindung tubuh saat hujan atau panas ☂️' },
        // — MAKANAN & MINUMAN —
    { word: 'rendang', hint: 'Masakan daging khas Padang yang kaya rempah 🍖' },
    { word: 'soto', hint: 'Sup berkuah kuning khas Indonesia 🍜' },
    { word: 'bakso', hint: 'Bola daging dalam kuah kaldu hangat 🍡' },
    { word: 'tempe', hint: 'Makanan fermentasi kedelai khas Indonesia 🫘' },
    { word: 'tahu', hint: 'Makanan putih lembut dari kedelai 🟨' },
    { word: 'kerupuk', hint: 'Camilan renyah yang sering menemani makan 🍘' },
    { word: 'mangga', hint: 'Buah tropis kuning manis yang harum 🥭' },
    { word: 'semangka', hint: 'Buah besar berair merah segar di dalamnya 🍉' },
    { word: 'anggur', hint: 'Buah kecil ungu atau hijau tumbuh bergerombol 🍇' },
    { word: 'coklat', hint: 'Camilan manis terbuat dari biji kakao 🍫' },
    { word: 'kopi', hint: 'Minuman hitam pahit yang populer di pagi hari ☕' },
    { word: 'teh', hint: 'Minuman panas dari daun yang diseduh 🍵' },
    { word: 'susu', hint: 'Minuman putih bergizi dari sapi 🥛' },
    { word: 'mie', hint: 'Makanan berbentuk panjang tipis dari tepung 🍝' },
    { word: 'roti', hint: 'Makanan dari tepung yang dipanggang 🍞' },

    // — HEWAN —
    { word: 'kuda', hint: 'Hewan berkaki empat yang bisa ditunggangi 🐴' },
    { word: 'sapi', hint: 'Hewan ternak penghasil susu dan daging 🐄' },
    { word: 'kambing', hint: 'Hewan ternak berjanggut yang suka rumput 🐐' },
    { word: 'ayam', hint: 'Unggas yang berkokok di pagi hari 🐔' },
    { word: 'bebek', hint: 'Unggas air yang berjalan menggemaskan 🦆' },
    { word: 'kelinci', hint: 'Hewan berbulu lembut dengan telinga panjang 🐰' },
    { word: 'monyet', hint: 'Primata lincah yang suka memanjat pohon 🐒' },
    { word: 'beruang', hint: 'Hewan besar berbulu lebat pemakan madu 🐻' },
    { word: 'lumba', hint: 'Mamalia laut cerdas yang suka melompat 🐬' },
    { word: 'penyu', hint: 'Reptil laut bercangkang keras yang lambat 🐢' },

    // — ALAM & CUACA —
    { word: 'pelangi', hint: 'Busur warna-warni di langit setelah hujan 🌈' },
    { word: 'salju', hint: 'Kristal es putih yang turun dari langit ❄️' },
    { word: 'petir', hint: 'Kilatan cahaya di langit saat hujan deras ⚡' },
    { word: 'sungai', hint: 'Aliran air tawar yang menuju ke laut 🏞️' },
    { word: 'danau', hint: 'Genangan air tawar yang dikelilingi daratan 🌊' },
    { word: 'hutan', hint: 'Kawasan lebat penuh pepohonan dan satwa 🌲' },
    { word: 'padang', hint: 'Hamparan tanah luas dengan rumput hijau 🌿' },
    { word: 'pantai', hint: 'Tepi laut berpasir tempat bermain ombak 🏖️' },
    { word: 'volcano', hint: 'Gunung berapi yang bisa meletus 🌋' },
    { word: 'banjir', hint: 'Air meluap menggenangi daratan saat hujan lebat 💧' },

    // — BENDA SEHARI-HARI —
    { word: 'cermin', hint: 'Benda kaca untuk melihat pantulan wajah 🪞' },
    { word: 'kursi', hint: 'Tempat duduk berkaki empat 🪑' },
    { word: 'meja', hint: 'Perabot datar berkaki untuk menaruh benda 🪵' },
    { word: 'lampu', hint: 'Sumber cahaya buatan manusia 💡' },
    { word: 'pintu', hint: 'Akses masuk dan keluar sebuah ruangan 🚪' },
    { word: 'jendela', hint: 'Lubang berkaca di dinding untuk cahaya dan udara 🪟' },
    { word: 'kunci', hint: 'Alat kecil untuk membuka dan mengunci pintu 🔑' },
    { word: 'tas', hint: 'Wadah untuk membawa barang bawaan 👜' },
    { word: 'sepatu', hint: 'Alas kaki pelindung yang dipakai sehari-hari 👟' },
    { word: 'kacamata', hint: 'Lensa berbingkai untuk membantu penglihatan 👓' },

    // — PROFESI & AKTIVITAS —
    { word: 'dokter', hint: 'Profesi yang merawat dan menyembuhkan pasien 👨‍⚕️' },
    { word: 'guru', hint: 'Profesi yang mendidik dan mengajar murid 👨‍🏫' },
    { word: 'polisi', hint: 'Penjaga keamanan dan ketertiban masyarakat 👮' },
    { word: 'pilot', hint: 'Pengemudi pesawat terbang ✈️' },
    { word: 'koki', hint: 'Ahli memasak di restoran atau dapur 👨‍🍳' },
    { word: 'nelayan', hint: 'Orang yang mencari ikan di laut atau sungai 🎣' },
    { word: 'petani', hint: 'Orang yang bercocok tanam di sawah atau ladang 👨‍🌾' },
    { word: 'pelukis', hint: 'Seniman yang membuat karya dengan cat dan kuas 🎨' },

    // — TEMPAT —
    { word: 'sekolah', hint: 'Tempat belajar dan menuntut ilmu 🏫' },
    { word: 'rumahsakit', hint: 'Tempat merawat orang yang sedang sakit 🏥' },
    { word: 'pasar', hint: 'Tempat jual beli berbagai kebutuhan sehari-hari 🏪' },
    { word: 'bandara', hint: 'Tempat pesawat terbang mendarat dan berangkat ✈️' },
    { word: 'pelabuhan', hint: 'Tempat kapal berlabuh dan bersandar ⚓' },
    { word: 'masjid', hint: 'Tempat ibadah umat Islam 🕌' },
    { word: 'gereja', hint: 'Tempat ibadah umat Kristen ⛪' },

]

// ================================
// CONFIG
// ================================
const TOTAL_SOAL = 10
const SOAL_DURATION = 60 * 1000   // 1 menit per soal
const MAX_WRONG = 3
const POINTS_CORRECT = 10
const POINTS_WRONG = -5
const BASE_POINTS = 50

// ================================
// SESSION
// ================================
// sessions[groupId] = {
//   soalList: [],        // 10 soal acak
//   currentIndex: 0,     // soal ke berapa
//   currentWord: '',
//   currentHint: '',
//   players: {},         // per soal: { id: { name, wrongCount } }
//   eliminated: [],      // eliminated per soal (reset tiap soal)
//   roundScore: {},      // akumulasi poin ronde: { id: { name, total } }
//   answered: false,
//   endTime: 0,
//   timer: null
// }
const sessions = {}

// ================================
// HELPER
// ================================
function getMaskedWord(word) {
    return word
        .split('')
        .map((c, i) => (i === 0 || i === word.length - 1 ? c : '_'))
        .join(' ')
}

function shuffle(arr) {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]]
    }
    return a
}

function formatLeaderboard(groupId) {
    const board = getLeaderboard(groupId)
    if (board.length === 0) return '📭 Belum ada data leaderboard.'
    const medals = ['🥇', '🥈', '🥉']
    return board
        .slice(0, 10)
        .map((p, i) => `${medals[i] || `${i + 1}.`} ${p.name} — *${p.points} poin*`)
        .join('\n')
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

    // semua soal selesai
    if (session.currentIndex >= TOTAL_SOAL) {
        return endGame(sock, groupId)
    }

    const soal = session.soalList[session.currentIndex]
    session.currentWord = soal.word
    session.currentHint = soal.hint
    session.players = {}
    session.eliminated = []
    session.answered = false
    session.endTime = Date.now() + SOAL_DURATION

    session.timer = setTimeout(async () => {
        await sock.sendMessage(groupId, {
            text:
                `⏰ *Waktu habis untuk soal ${session.currentIndex + 1}!*\n\n` +
                `🔑 Jawaban: *${soal.word}*\n\n` +
                `⏳ Soal berikutnya dalam 3 detik...`
        })
        session.currentIndex++
        setTimeout(() => nextSoal(sock, groupId), 3000)
    }, SOAL_DURATION)

    await sock.sendMessage(groupId, {
        text:
            `📝 *SOAL ${session.currentIndex + 1} dari ${TOTAL_SOAL}*\n\n` +
            `💡 Petunjuk: *${soal.hint}*\n` +
            `🔤 Kata (${soal.word.length} huruf): *${getMaskedWord(soal.word)}*\n` +
            `⏳ Waktu: *1 menit*\n\n` +
            `Ketik *ayo tebak jawaban* untuk menebak!`
    })
}

// ================================
// END GAME
// ================================
async function endGame(sock, groupId) {
    const session = sessions[groupId]
    if (!session) return

    clearTimeout(session.timer)

    const scoreText = formatRoundScore(session.roundScore)

    // update leaderboard dengan poin ronde
    for (const [id, p] of Object.entries(session.roundScore)) {
        if (p.total !== 0) {
            updatePoints(groupId, id, p.name, p.total)
        }
    }

    // top 3 ronde ini
    const top = Object.values(session.roundScore)
        .sort((a, b) => b.total - a.total)
        .slice(0, 3)

    let winnerText = ''
    if (top.length > 0 && top[0].total > 0) {
        winnerText = `\n\n🏆 *Pemenang Ronde:* ${top[0].name} (+${top[0].total} poin)`
    }

    delete sessions[groupId]

    await sock.sendMessage(groupId, {
        text:
            `🎮 *GAME SELESAI! (${TOTAL_SOAL} Soal)*\n` +
            `━━━━━━━━━━━━━━━━━━\n\n` +
            `📊 *Skor Ronde Ini:*\n` +
            scoreText +
            winnerText +
            `\n\n━━━━━━━━━━━━━━━━━━\n` +
            `📋 Ketik *!leaderboard* untuk peringkat keseluruhan\n` +
            `🎮 Ketik *!tebak* untuk main lagi!`
    })
}

// ================================
// MAIN HANDLER
// ================================
async function handleTebakKata(sock, msg, from, cmd, args, senderName) {
    const isGroup = from.endsWith('@g.us')

    // ================================
    // !tebak — mulai game
    // ================================
    if (cmd === 'tebak') {
        if (!isGroup) {
            return sock.sendMessage(from, {
                text: `❌ Game ini hanya bisa dimainkan di grup!`
            })
        }

        if (sessions[from]) {
            const session = sessions[from]
            const remaining = Math.ceil((session.endTime - Date.now()) / 1000)
            return sock.sendMessage(from, {
                text:
                    `⚠️ Game sedang berlangsung!\n\n` +
                    `📝 Soal *${session.currentIndex + 1} dari ${TOTAL_SOAL}*\n` +
                    `💡 Petunjuk: ${session.currentHint}\n` +
                    `🔤 Kata (${session.currentWord.length} huruf): *${getMaskedWord(session.currentWord)}*\n` +
                    `⏳ Sisa waktu: *${remaining} detik*\n\n` +
                    `Ketik *ayo tebak jawaban* untuk ikut bermain!`
            })
        }

        // acak dan ambil 10 soal
        const soalList = shuffle(words).slice(0, TOTAL_SOAL)

        sessions[from] = {
            soalList,
            currentIndex: 0,
            currentWord: '',
            currentHint: '',
            players: {},
            eliminated: [],
            roundScore: {},
            answered: false,
            endTime: 0,
            timer: null
        }

        await sock.sendMessage(from, {
            text:
                `🎮 *GAME TEBAK KATA DIMULAI!*\n` +
                `━━━━━━━━━━━━━━━━━━\n\n` +
                `📋 *${TOTAL_SOAL} soal* akan diberikan satu per satu\n` +
                `⏳ Setiap soal: *1 menit*\n` +
                `✅ Jawaban benar: *+${POINTS_CORRECT} poin*\n` +
                `❌ Jawaban salah: *${POINTS_WRONG} poin*\n` +
                `💀 Salah *${MAX_WRONG}x*: tersingkir dari soal itu\n\n` +
                `Ketik *ayo tebak jawaban* untuk menebak!\n\n` +
                `━━━━━━━━━━━━━━━━━━\n` +
                `⏳ Soal pertama dalam 3 detik...`
        })

        setTimeout(() => nextSoal(sock, from), 3000)
        return
    }

    // ================================
    // !stoptebak
    // ================================
    if (cmd === 'stoptebak') {
        if (!sessions[from]) {
            return sock.sendMessage(from, {
                text: `❌ Tidak ada game yang sedang berjalan.\n\nKetik *!tebak* untuk mulai!`
            })
        }
        clearTimeout(sessions[from].timer)
        delete sessions[from]
        return sock.sendMessage(from, {
            text: `🏳️ Game dihentikan.\n\nKetik *!tebak* untuk main lagi!`
        })
    }

    // ================================
    // !leaderboard
    // ================================
    if (cmd === 'leaderboard') {
        if (!isGroup) return
        return sock.sendMessage(from, {
            text:
                `🏆 *LEADERBOARD*\n` +
                `━━━━━━━━━━━━━━━━━━\n` +
                formatLeaderboard(from) +
                `\n━━━━━━━━━━━━━━━━━━\n` +
                `💡 Poin dasar pemain baru: *${BASE_POINTS}*`
        })
    }

    // ================================
    // !poin
    // ================================
    if (cmd === 'poin') {
        if (!isGroup) return
        const senderId = msg.key.participant || msg.key.remoteJid
        const playerData = getPlayerData(from, senderId, senderName)
        return sock.sendMessage(from, {
            text:
                `💰 *Poin kamu saat ini:*\n\n` +
                `👤 ${senderName}\n` +
                `⭐ *${playerData.points} poin*`
        })
    }
}

// ================================
// HANDLER "ayo tebak"
// ================================
async function handleAyoTebak(sock, msg, from, body, senderName) {
    const senderId = msg.key.participant || msg.key.remoteJid
    const session = sessions[from]

    if (!session) return

    const lowerBody = body.toLowerCase().trim()
    if (!lowerBody.startsWith('ayo tebak')) return

    const guess = lowerBody
        .replace('ayo tebak', '')
        .replace(/[<>]/g, '')
        .trim()

    if (!guess) {
        return sock.sendMessage(from, {
            text: `⚠️ @${senderId.split('@')[0]} Tulis jawabannya!\nContoh: *ayo tebak kucing*`,
            mentions: [senderId]
        })
    }

    // inisialisasi player
    if (!session.players[senderId]) {
        getPlayerData(from, senderId, senderName)
        session.players[senderId] = {
            name: senderName,
            wrongCount: 0
        }
    }

    // inisialisasi roundScore
    if (!session.roundScore[senderId]) {
        session.roundScore[senderId] = {
            name: senderName,
            total: 0
        }
    }

    const player = session.players[senderId]
    const remaining = Math.ceil((session.endTime - Date.now()) / 1000)

    // cek tersingkir
    if (session.eliminated.includes(senderId)) {
        return sock.sendMessage(from, {
            text: `❌ @${senderId.split('@')[0]} Kamu tersingkir dari soal ini! Tunggu soal berikutnya.`,
            mentions: [senderId]
        })
    }

    // cek sudah dijawab
    if (session.answered) {
        return sock.sendMessage(from, {
            text: `✅ Soal ini sudah terjawab! Tunggu soal berikutnya.`
        })
    }

    // ✅ BENAR
    if (guess === session.currentWord) {
        session.answered = true
        session.roundScore[senderId].total += POINTS_CORRECT
        clearTimeout(session.timer)

        await sock.sendMessage(from, {
            text:
                `🎉 *BENAR!* @${senderId.split('@')[0]} berhasil menebak!\n\n` +
                `🔑 Jawaban: *${session.currentWord}*\n` +
                `⭐ +${POINTS_CORRECT} poin\n\n` +
                `⏳ Soal berikutnya dalam 3 detik...`,
            mentions: [senderId]
        })

        session.currentIndex++
        setTimeout(() => nextSoal(sock, from), 3000)
        return
    }

    // ❌ SALAH
    player.wrongCount++
    session.roundScore[senderId].total += POINTS_WRONG
    const sisaKesempatan = MAX_WRONG - player.wrongCount

    if (sisaKesempatan <= 0) {
        session.eliminated.push(senderId)
        return sock.sendMessage(from, {
            text:
                `💀 @${senderId.split('@')[0]} *Kamu tersingkir dari soal ini!*\n` +
                `Sudah salah *${MAX_WRONG}x*.\n` +
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

module.exports = { handleTebakKata, handleAyoTebak }