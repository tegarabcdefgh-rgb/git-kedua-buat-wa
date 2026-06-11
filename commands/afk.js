const fs = require('fs')
const path = require('path')

const FILE = path.join(
    __dirname,
    '../data/afk.json'
)

function loadData() {

    if (!fs.existsSync(FILE)) {

        fs.writeFileSync(
            FILE,
            JSON.stringify({})
        )
    }

    return JSON.parse(
        fs.readFileSync(FILE,'utf8')
    )
}

function saveData(data) {

    fs.writeFileSync(
        FILE,
        JSON.stringify(data,null,2)
    )
}

async function handleAfk(
    sock,
    msg,
    from,
    args,
    senderName
) {

    const senderId =
        msg.key.participant ||
        msg.key.remoteJid

    const reason =
        args.join(' ') ||
        'Tidak diketahui'

    const data = loadData()

    data[senderId] = {
        reason,
        time: Date.now(),
        name: senderName
    }

    saveData(data)

    return sock.sendMessage(
        from,
        {
            text:
`💤 @${senderId.split('@')[0]}

AFK

Alasan:
${reason}`,
            mentions:[senderId]
        }
    )
}

async function checkAfkReturn(
    sock,
    msg,
    from
) {

    const senderId =
        msg.key.participant ||
        msg.key.remoteJid

    const data = loadData()

    if (data[senderId]) {

        const name =
            data[senderId].name

        delete data[senderId]

        saveData(data)

        await sock.sendMessage(
            from,
            {
                text:
`👋 Selamat datang kembali

${name}

Status AFK dihapus.`
            }
        )
    }
}

function formatDuration(ms) {

    const menit =
        Math.floor(ms / 60000)

    const jam =
        Math.floor(menit / 60)

    if (jam > 0) {
        return `${jam} jam ${menit % 60} menit`
    }

    return `${menit} menit`
}

async function checkAfkMention(
    sock,
    msg,
    from
) {

    const data = loadData()

    const mentions =
        msg.message?.extendedTextMessage
            ?.contextInfo
            ?.mentionedJid || []

    if (!mentions.length)
        return

    for (const jid of mentions) {

        if (!data[jid])
            continue

        const afk = data[jid]

        const duration =
            formatDuration(
                Date.now() - afk.time
            )

        await sock.sendMessage(
            from,
            {
                text:
`💤 Hachuu yang lain Jangan ganggu dia dulu ya.

@${jid.split('@')[0]}
sedang AFK nih.

📝 Alasan:
${afk.reason}

⏰ Sejak:
${duration}`,
                mentions: [jid]
            }
        )
    }
}

module.exports = {
    handleAfk,
    checkAfkReturn,
    checkAfkMention
}