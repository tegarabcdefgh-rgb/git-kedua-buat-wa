const { handleSticker } = require('./commands/sticker')
const { handleGroup } = require('./commands/group')
const { handleTebakKata, handleAyoTebak } = require('./commands/tebakkata')
const fs = require('fs')
const { handleTikTok } = require('./commands/tiktok')
const { handleSiapaAku, handleAyoTebakSiapa } = require('./commands/tebaksiapaaku')
const { handleTebakEmoji, handleAyoTebakEmoji } = require('./commands/tebakemoji')
const { handleKuis, handleJawabKuis } = require('./commands/kuismtk')
const { handleSambungKata, handleJawabSambungKata } = require('./commands/sambungkata')
const { loadData, saveData} = require('./lib/autogroup')
const {handleMessageStats } = require('./commands/messagecount')
const { handleAfk, checkAfkReturn, checkAfkMention } = require('./commands/afk')

async function handleCommand(sock, msg, from, body, senderName) {
    const prefix = '!'
    await handleAyoTebak(sock, msg, from, body, senderName)
    await handleAyoTebakSiapa(sock, msg, from, body, senderName)
    await handleAyoTebakEmoji(sock, msg, from, body, senderName)
    await handleJawabKuis(sock, msg, from, body, senderName)
    await handleAyoTebak(sock, msg, from, body, senderName)
    await handleJawabSambungKata(sock,msg,from,body,senderName)
    await checkAfkReturn( sock, msg, from)
   

    if (!body || !body.startsWith(prefix)) return

    const [rawCmd, ...args] = body
        .slice(prefix.length)
        .trim()
        .split(/\s+/)

    const cmd = rawCmd.toLowerCase()
    await handleMessageStats(sock, msg, from,cmd)

    console.log('CMD:', cmd)
const path = require('path')

const AUTO_GROUP_FILE = path.join(
    __dirname,
    './data/autogroup.json'
)

function loadAutoGroup() {
    if (!fs.existsSync(AUTO_GROUP_FILE)) {
        fs.writeFileSync(
            AUTO_GROUP_FILE,
            JSON.stringify({})
        )
    }

    return JSON.parse(
        fs.readFileSync(
            AUTO_GROUP_FILE,
            'utf8'
        )
    )
}

function saveAutoGroup(data) {
    fs.writeFileSync(
        AUTO_GROUP_FILE,
        JSON.stringify(data, null, 2)
    )
}
    switch (cmd) {

        // =========================
        // INFO
        // =========================
        case 'halo':
        case 'hi':
            return sock.sendMessage(from, {
                text:
                    '👋 Halo!\n\n' +
                    'Saya *Kim Ju-eun (JUUN)* dari Hearts2Hearts 💙\n' +
                    'Apa yang bisa saya bantu hari ini?\n\n' +
                    'Ketik *!menu* untuk melihat fitur yang tersedia.'
            })

case 'tiktok':
case 'tt':
    return handleTikTok(
        sock,
        msg,
        from,
        args
    )

case 'autogroup': {

    const data = loadAutoGroup()

    if (!data[from]) {

        data[from] = {
            enabled: true,
            open: '18:00',
            close: '23:00'
        }

    } else {

        data[from].enabled =
            !data[from].enabled
    }

    saveAutoGroup(data)

    return sock.sendMessage(from,{
        text:
            data[from].enabled
            ? '✅ Auto buka/tutup grup aktif'
            : '❌ Auto buka/tutup grup nonaktif'
    })
}
case 'tutupgrup':

    await sock.groupSettingUpdate(
        from,
        'announcement'
    )

    return sock.sendMessage(from,{
        text:'🔒 Grup ditutup'
    })

case 'bukagrup':

    await sock.groupSettingUpdate(
        from,
        'not_announcement'
    )

    return sock.sendMessage(from,{
        text:'🔓 Grup dibuka'
    })
case 'statusautogroup': {

    const data = loadAutoGroup()

    if (!data[from]) {

        return sock.sendMessage(from,{
            text:'❌ AutoGroup belum diaktifkan'
        })
    }

    return sock.sendMessage(from,{
        text:
`🤖 AUTO GROUP

Status:
${data[from].enabled ? 'Aktif' : 'Nonaktif'}

Buka:
${data[from].open}

Tutup:
${data[from].close}`
    })
}
case 'setbuka': {

    if (!args[0]) {

        return sock.sendMessage(from,{
            text:'Contoh:\n!setbuka 18:00'
        })
    }

    const data = loadAutoGroup()

    if (!data[from]) {

        data[from] = {
            enabled: true,
            open: args[0],
            close: '23:00'
        }

    } else {

        data[from].open = args[0]
    }

    saveAutoGroup(data)

    return sock.sendMessage(from,{
        text:`✅ Jam buka diubah menjadi ${args[0]}`
    })
}
case 'settutup': {

    if (!args[0]) {

        return sock.sendMessage(from,{
            text:'Contoh:\n!settutup 23:00'
        })
    }

    const data = loadAutoGroup()

    if (!data[from]) {

        data[from] = {
            enabled: true,
            open: '18:00',
            close: args[0]
        }

    } else {

        data[from].close = args[0]
    }

    saveAutoGroup(data)

    return sock.sendMessage(from,{
        text:`✅ Jam tutup diubah menjadi ${args[0]}`
    })
}
case 'offautogroup': {

    const data = loadAutoGroup()

    if (data[from]) {

        data[from].enabled = false
    }

    saveAutoGroup(data)

    return sock.sendMessage(from,{
        text:'❌ Auto buka/tutup grup dimatikan'
    })
}
        case 'menu':
        case 'help': {
            const images = [
                './assets/juunimut1.jpg',
                './assets/juunimut2.jpg',
                './assets/juunimut3.jpg',
                './assets/juun14.jpg',
                './assets/juun13.jpg',
                './assets/juun1.jpg',
                './assets/juun2.jpg',
                './assets/juun3.jpg',
                './assets/juun5.jpg',
                './assets/juun15.jpg',
                './assets/juun16.jpg',
                './assets/juun6.jpg',
                './assets/juun7.jpg',
                './assets/juun8.jpg',
                './assets/juunkacamata1.jpg',
                './assets/juunkacamata2.jpg',
                './assets/juun9.jpg',
                './assets/juun10.jpg',
                './assets/juun11.jpg',
                './assets/juunlemon1.jpg',
                './assets/juunlemon2.jpg',
                './assets/juun12.jpg',
                './assets/juun17.jpg',
                './assets/juun18.jpg',
            ]

            const randomImage = images[Math.floor(Math.random() * images.length)]

            return sock.sendMessage(from, {
                image: fs.readFileSync(randomImage),
                caption:
`👾💜 *KIM JU-EUN (JUUN)* 💜👾

━━━━━━━━━━━━━━━━━━

💬 Apa yang dapat *JUUN HEARTS2HEARTS* lakukan untuk membantu Anda?

👾 *STIKER*
- !stiker
- !sticker
- !s

👾 *MANAJEMEN GRUP*
- !kick @user
- !add 628xxxx
- !promote @user
- !demote @user
- !mute
- !unmute
- !tagall
- !grupinfo
- !link
- !resetlink

👾 DOWNLOAD
- !tiktok link
- !tt link

👾 AUTO GROUP
- !autogroup

👾 *GAME*
- !tebak — mulai tebak kata
- ayo tebak jawaban — ikut menebak (contoh: ayo tebak kucing)
- !siapaaku — tebak siapa aku (3 clue)
- !tebakemoji — tebak arti emoji
- !kuis — kuis matematika cepat

👾*HENTIKAN GAME*
- !stoptebak — hentikan game

👾*SAMBUNG KATA*
- !joinsambungkata
- !mulaipermainan
- !statussambungkata
- !keluarsambungkata
- !stopsambungkata

🎮 *Peringkat*
- !leaderboard — lihat peringkat
- !poin — cek poin kamu

👾 STATISTIK CHAT
- !pesan
- !topchat
- !totalgrup
- !listchat
- !resetchat

👾 *UTILITAS*
- !ping

👾 *INFORMASI*
- !menu
- !help

━━━━━━━━━━━━━━━━━━

💜 JUUN siap membantu Anda!
👾 Powered by Hearts2Hearts 👾`
            })
        }

        case 'ping':
            return sock.sendMessage(from, {
                text:
`👾💜 Hai, JUUN disini!

✨ Status Bot : Online
💜 Kim Ju-eun siap membantu Anda.

👾 Ketik *!menu* untuk melihat fitur yang tersedia.`
            })

        // =========================
        // STIKER
        // =========================
        case 'stiker':
        case 'sticker':
        case 's':
            return handleSticker(sock, msg, from, args)

        // =========================
        // GRUP
        // =========================
        case 'kick':
        case 'add':
        case 'promote':
        case 'demote':
        case 'mute':
        case 'unmute':
        case 'grupinfo':
        case 'link':
        case 'resetlink':
        case 'tagall':
            console.log('GROUP COMMAND:', cmd)
            return handleGroup(sock, msg, from, cmd, args)

        // =========================
        // GAME
        // =========================
        case 'tebak':
        case 'stoptebak':
        case 'leaderboard':
        case 'poin':
            return handleTebakKata(sock, msg, from, cmd, args, senderName)
        // tambah di switch case
        case 'siapaaku':
        case 'stopsiapaaku':
           return handleSiapaAku(sock, msg, from, cmd, args, senderName)

        case 'tebakemoji':
        case 'stoptebakemoji':
    return handleTebakEmoji(sock, msg, from, cmd, args, senderName)

        case 'kuis':
        case 'stopkuis':
            return handleKuis(sock, msg, from, cmd, args, senderName)
        case 'joinsambungkata':
        case 'mulaipermainan':
        case 'keluarsambungkata':
        case 'statussambungkata':
        case 'stopsambungkata':
          return handleSambungKata(sock, msg, from, cmd, args,senderName)
        default:


        case 'autogroup': {

    const data = loadData()

    if (!data[from]) {

        data[from] = {
            enabled: true
        }

    } else {

        data[from].enabled =
            !data[from].enabled
    }

    saveData(data)

    return sock.sendMessage(from, {
        text:
            data[from].enabled
            ? '✅ Auto buka/tutup grup aktif'
            : '❌ Auto buka/tutup grup nonaktif'
    })
}
case 'afk':
    return handleAfk( sock,msg,from,args,senderName)

            return sock.sendMessage(from, {
                text:
                    `❌ Command *${cmd}* tidak ditemukan.\n\n` +
                    `Ketik *!menu* untuk melihat daftar command.`
            })
    }
}

module.exports = { handleCommand }