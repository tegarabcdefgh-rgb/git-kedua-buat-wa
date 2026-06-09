const { PREFIX, BOT_NAME } = require('../config')

async function sendMenu(sock, msg, from) {
    const isGroup = from.endsWith('@g.us')

    let text = `
╔══════════════════════╗
║  📋 ${BOT_NAME}
╚══════════════════════╝

🖼️ STIKER
• ${PREFIX}stiker

⚙️ UMUM
• ${PREFIX}ping
• ${PREFIX}menu
`

    if (isGroup) {
        text += `

👥 GRUP
• ${PREFIX}kick
• ${PREFIX}add
• ${PREFIX}promote
• ${PREFIX}demote
• ${PREFIX}tagall
`
    }

    await sock.sendMessage(
        from,
        { text },
        { quoted: msg }
    )
}

module.exports = { sendMenu }