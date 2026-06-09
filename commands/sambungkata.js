const fs = require('fs')
const path = require('path')

const DATA_FILE = path.join(__dirname, '../data/leaderboard.json')

const games = {}

const MAX_HP = 3
const TURN_TIMEOUT = 30000

const REWARD = {
    1: 50,
    2: 30,
    3: 15
}
const kamusPath = path.join(
    __dirname,
    '../data/kamus.txt'
)


const words = fs
    .readFileSync(kamusPath, 'utf8')
    .split(/\r?\n/)
    .map(k => k.trim().toLowerCase())
    .filter(k => k.length > 0)

const wordSet = new Set(words)
console.log(`Kamus dimuat: ${words.length} kata`)
console.log(`Test kata "aku": ${wordSet.has('aku')}`)
function loadData() {
    if (!fs.existsSync(DATA_FILE)) {
        fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true })
        fs.writeFileSync(DATA_FILE, JSON.stringify({}))
    }
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
}

function saveData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
}

function updatePoints(groupId, playerId, playerName, delta) {
    const data = loadData()

    if (!data[groupId]) data[groupId] = {}

    if (!data[groupId][playerId]) {
        data[groupId][playerId] = {
            name: playerName,
            points: 50
        }
    }

    data[groupId][playerId].name = playerName
    data[groupId][playerId].points += delta

    if (data[groupId][playerId].points < 0)
        data[groupId][playerId].points = 0

    saveData(data)
}

async function nextTurn(sock, groupId) {
    const game = games[groupId]

    if (!game) return

    clearTimeout(game.timer)

    const alive = game.players.filter(p => p.hp > 0)

    if (alive.length <= 1) {
        console.log('ALIVE:', alive.length)
        console.log(
            game.players.map(p => ({
                name: p.name,
                hp: p.hp
            }
        )
    )
)
        return endGame(sock, groupId)
    }

    let player = game.players[game.turn]

    while (player.hp <= 0) {
        game.turn++
        if (game.turn >= game.players.length)
            game.turn = 0

        player = game.players[game.turn]
    }

    const ending = game.currentWord.slice(-2)

    const sent = await sock.sendMessage(groupId, {
        text:
`🎮 Sambung Kata

Kata saat ini:
*${game.currentWord.toUpperCase()}*

Awalan:
*${ending.toUpperCase()}*

👤 Giliran:
@${player.id.split('@')[0]}

❤️ Nyawa: ${player.hp}`,
        mentions: [player.id]
    })

    game.lastQuestionId = sent.key.id

    game.timer = setTimeout(async () => {
        player.hp--

        await sock.sendMessage(groupId, {
            text:
`⏰ Waktu habis!

@${player.id.split('@')[0]}
kehilangan 1 nyawa.

❤️ Sisa: ${player.hp}`,
            mentions: [player.id]
        })

        if (player.hp <= 0) {
            game.rankings.push(player)
        }

        game.turn++
        if (game.turn >= game.players.length)
            game.turn = 0

        nextTurn(sock, groupId)
    }, TURN_TIMEOUT)
}

async function endGame(sock, groupId) {
    try {
        const alive = game.players.filter(p => p.hp > 0)
        let ranking = []
        if (alive.length > 0) {
            ranking = [
            alive[0],...game.rankings.slice().reverse()
    ]
} else 
    {ranking = [
        ...game.rankings.slice().reverse()
    ]
}
    } catch(err) {
        console.error(
            'ENDGAME ERROR:',
            err
        )
    }


    let result = result =
`🎉 PEMENANG
👑 ${ranking[0].name}

🏆 HASIL AKHIR


`

    ranking.forEach((p, i) => {
        const pos = i + 1

        if (pos === 1) {
            updatePoints(groupId,p.id,p.name,50)
            result += `🥇 ${p.name} (+50)\n`
        }
        else if (pos === 2) {
            updatePoints(groupId,p.id,p.name,30)
            result += `🥈 ${p.name} (+30)\n`
        }
        else if (pos === 3) {
            updatePoints(groupId,p.id,p.name,15)
            result += `🥉 ${p.name} (+15)\n`
        }
        else {
            const minus = pos * 5

            updatePoints(
                groupId,
                p.id,
                p.name,
                -minus
            )

            result += `${pos}. ${p.name} (-${minus})\n`
        }
    })

    delete games[groupId]

    return sock.sendMessage(groupId,{
        text: result
    })
}

async function handleSambungKata(
    sock,
    msg,
    from,
    cmd,
    args,
    senderName
) {
    const senderId =
        msg.key.participant ||
        msg.key.remoteJid

    if (cmd === 'joinsambungkata') {

        if (!games[from]) {
            games[from] = {
                started: false,
                players: [],
                turn: 0,
                currentWord: '',
                usedWords: [],
                rankings: [],
                timer: null,
                lastQuestionId: null
            }
        }

        const game = games[from]

        if (game.started) {
            return sock.sendMessage(from,{
                text:'❌ Game sudah dimulai'
            })
        }

        const exists = game.players.find(
            p => p.id === senderId
        )

        if (exists) {
            return sock.sendMessage(from,{
                text:'⚠️ Kamu sudah join'
            })
        }

        game.players.push({
            id: senderId,
            name: senderName,
            hp: MAX_HP
        })

        return sock.sendMessage(from,{
            text:
`✅ ${senderName} bergabung

Jumlah pemain:
${game.players.length}`
        })
    }

    if (cmd === 'mulaipermainan') {

        const game = games[from]

        if (!game)
            return

        if (game.players.length < 2) {
            return sock.sendMessage(from,{
                text:'❌ Minimal 2 pemain'
            })
        }

        game.started = true

        const firstWord =
            words[Math.floor(
                Math.random() * words.length
            )]

        game.currentWord = firstWord
        game.usedWords.push(firstWord)

        return nextTurn(sock, from)
    }

    if (cmd === 'statussambungkata') {

        const game = games[from]

        if (!game)
            return

        let text =
`🎮 STATUS GAME

Kata:
${game.currentWord}

Pemain:

`

        game.players.forEach((p,i)=>{
            text +=
`${i+1}. ${p.name}
❤️ ${p.hp}

`
        })

        return sock.sendMessage(from,{
            text
        })
    }

    if (cmd === 'keluarsambungkata') {

        const game = games[from]

        if (!game) return

        game.players =
            game.players.filter(
                p => p.id !== senderId
            ) 
        if (game.turn >= game.players.length) {
            game.turn = 0
        }

        return sock.sendMessage(from,{
            text:'🚪 Keluar dari permainan'
        })
    }

    if (cmd === 'stopsambungkata') {

        delete games[from]

        return sock.sendMessage(from,{
            text:'🛑 Game dihentikan'
        })
    }
}
async function handleJawabSambungKata(
    sock,
    msg,
    from,
    body,
    senderName
) {
    const game = games[from]

    if (!game) return
    if (!game.started) return

    if (!msg.message?.extendedTextMessage)
        return

    const senderId =
        msg.key.participant ||
        msg.key.remoteJid

    const current =
        game.players[game.turn]

    if (senderId !== current.id)
        return

    const answer =
        body.toLowerCase().trim()

    const expected =
        game.currentWord
            .slice(-2)
            .toLowerCase()

    if (!answer.startsWith(expected)) {

        current.hp--

        await sock.sendMessage(from,{
            text:
`❌ Salah

Awalan harus:
${expected}

❤️ Sisa:
${current.hp}`
        })

        if (current.hp <= 0) {
            game.rankings.unshift(current)
        }

        game.turn++

        if (game.turn >= game.players.length)
            game.turn = 0

        return nextTurn(sock, from)
    }

    if (!wordSet.has(answer)) {

    return sock.sendMessage(from,{
        text:`❌ Kata *${answer}* tidak ada di kamus`
    })
}

    if (game.usedWords.includes(answer)) {

        return sock.sendMessage(from,{
            text:'❌ Kata sudah pernah dipakai'
        })
    }

    clearTimeout(game.timer)

    game.currentWord = answer
    game.usedWords.push(answer)

    game.turn++

    if (game.turn >= game.players.length)
        game.turn = 0

    return nextTurn(sock, from)
}
module.exports = {
    handleSambungKata,
    handleJawabSambungKata
}