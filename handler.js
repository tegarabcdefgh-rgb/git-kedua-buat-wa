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
const { handleIntro } = require('./commands/intro');
const { handleWarn } = require('./commands/warn');

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
    
     await handleMessageStats(sock, msg, from, cmd)
    const statsCommands = ['pesan', 'topchat', 'totalgrup', 'listchat', 'resetchat'];
    if (statsCommands.includes(cmd)) return;

    console.log('CMD:', cmd)

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
            const menuDir = path.join(__dirname, 'assets', 'menu');
            let imageBuffer = null;
            let images = [];

            if (fs.existsSync(menuDir)) {
                images = fs.readdirSync(menuDir).filter(f => /\.(jpg|jpeg|png)$/i.test(f));
            }

            if (images.length > 0) {
                const randomName = images[Math.floor(Math.random() * images.length)];
                imageBuffer = fs.readFileSync(path.join(menuDir, randomName));
            } else {
                // Fallback jika folder menu kosong: coba folder assets
                const assetsDir = path.join(__dirname, 'assets');
                if (fs.existsSync(assetsDir)) {
                    const fallbackImages = fs.readdirSync(assetsDir).filter(f => /\.(jpg|jpeg|png)$/i.test(f));
                    if (fallbackImages.length > 0) {
                        const randomName = fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
                        imageBuffer = fs.readFileSync(path.join(assetsDir, randomName));
                    }
                }
            }

            const caption = `👾💜 *KIM JU-EUN (JUUN)* 💜👾

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
- !statusautogroup
- !setbuka
- !settutup
- !offautogroup

👾 *INTRO GRUP*
- !intro - lihat intro grup
- !setintro [teks] - atur intro (admin)
- !resetintro - reset ke format default (admin)

👾 *SISTEM WARNING*
- !warn @user [alasan] - beri peringatan (admin)
- !unwarn @user - hapus 1 peringatan (admin)
- !resetwarn @user - hapus semua peringatan (admin)
- !checkwarn @user - lihat peringatan user
- !setwarnlimit <angka> - ubah batas maks warning
- !warnlimit - lihat batas warning grup

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
- !hi
- !afk [alasan] — set afk

👾 *INFORMASI*
- !menu
- !help

━━━━━━━━━━━━━━━━━━

💜 JUUN siap membantu Anda!
👾 Powered by Hearts2Hearts 👾`;

            if (imageBuffer) {
                return sock.sendMessage(from, { image: imageBuffer, caption: caption });
            } else {
                return sock.sendMessage(from, { text: caption });
            }
        }

        case 'ping':
            return sock.sendMessage(from, {
                text: `👾💜 Hai, JUUN disini!\n\n✨ Status Bot : Online\n💜 Kim Ju-eun siap membantu Anda.\n\n👾 Ketik *!menu* untuk melihat fitur yang tersedia.`
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

        case 'warn':
        case 'unwarn':
        case 'resetwarn':
        case 'checkwarn':
        case 'setwarnlimit':
        case 'warnlimit':
            return handleWarn(sock, msg, from,cmd, args, senderName);
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

    case 'intro':
case 'setintro':
case 'resetintro':
    return handleIntro(sock, msg, from, args, senderName);

        case 'kuis':
        case 'stopkuis':
            return handleKuis(sock, msg, from, cmd, args, senderName)
                case 'joinsambungkata':
        case 'mulaipermainan':
        case 'keluarsambungkata':
        case 'statussambungkata':
        case 'stopsambungkata':
            return handleSambungKata(sock, msg, from, cmd, args, senderName);

        case 'afk':
            return handleAfk(sock, msg, from, args, senderName);

        default:
            return sock.sendMessage(from, {
                text: `❌ Command *${cmd}* tidak ditemukan.\n\n` +
                      `Ketik *!menu* untuk melihat daftar command.`
            });
    }
}
module.exports = { handleCommand }