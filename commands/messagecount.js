const fs = require('fs')
const path = require('path')

const FILE = path.join(
    __dirname,
    '../data/messagecount.json'
)

function loadData() {
    if (!fs.existsSync(FILE)) {
        fs.mkdirSync(
            path.dirname(FILE),
            { recursive: true }
        )

        fs.writeFileSync(
            FILE,
            JSON.stringify({})
        )
    }

    return JSON.parse(
        fs.readFileSync(FILE, 'utf8')
    )
}

function saveData(data) {
    fs.writeFileSync(
        FILE,
        JSON.stringify(data, null, 2)
    )
}

// ======================
// HITUNG PESAN
// ======================

function addMessage(
    groupId,
    userId,
    userName
) {

    const data = loadData()

    if (!data[groupId]) {
        data[groupId] = {}
    }

    if (!data[groupId][userId]) {
        data[groupId][userId] = {
            name: userName,
            count: 0
        }
    }

    if (
        typeof data[groupId][userId].count !== 'number'
    ) {
        data[groupId][userId].count = 0
    }

    data[groupId][userId].name = userName
    data[groupId][userId].count++

    saveData(data)
}
// ======================
// SINKRON MEMBER
// ======================

async function syncGroupMembers(
    groupId,
    participants
) {

    const data = loadData()

    if (!data[groupId]) {
        data[groupId] = {}
    }

    for (const p of participants) {

        if (!data[groupId][p.id]) {

            data[groupId][p.id] = {
                name:
                    p.notify ||
                    p.id.split('@')[0],
                count: 0
            }

        } else {

            if (
                typeof data[groupId][p.id].count !== 'number'
            ) {
                data[groupId][p.id].count = 0
            }

            data[groupId][p.id].name =
                p.notify ||
                data[groupId][p.id].name
        }
    }

    saveData(data)
}
// ======================
// COMMAND
// ======================

async function handleMessageStats(
    sock,
    msg,
    from,
    cmd
) {

    const data = loadData()

    if (!data[from]) {
        data[from] = {}
    }

    // !pesan
  if (cmd === 'pesan') {

    const senderId =
        msg.key.participant ||
        msg.key.remoteJid

    const user =
        data[from][senderId]

    const total =
        user?.count || 0

    return sock.sendMessage(
        from,
        {
            text:
`┌──「 📨 *STATISTIK PESAN* 」
│
│  Nama  : *${user?.name || 'Kamu'}*
│  Pesan : *${total}*
│
└──────────────────`
        }
    )
    }

    // !topchat
if (cmd === 'topchat') {

    const ranking =
        Object.values(data[from])
        .filter(u => u.count > 0)
        .sort((a, b) =>
            b.count - a.count
        )

    let text =
`┌──「 🏆 *TOP CHAT GRUP* 」
│`

    ranking
    .slice(0, 10)
    .forEach((u, i) => {

        text +=
`\n│  ${String(i + 1)
    .padStart(2, '0')}. ${u.name}
│      ${u.count} pesan`
    })

    text +=
`\n│
└──────────────────`

    return sock.sendMessage(
        from,
        { text }
    )
}
    // !totalgrup
    if (cmd === 'totalgrup') {

    const metadata =
        await sock.groupMetadata(from)

    const totalAnggota =
        metadata.participants.length

    const users =
        Object.values(data[from])
    users.forEach(u => {
        if (typeof u.count !== 'number') {
        u.count = 0
    }
})
    const aktifChat =
        users.filter(
            u => u.count > 0
        ).length

    const totalPesan =
    users.reduce(
        (sum, u) =>
            sum + Number(u.count || 0),
        0
    )

    return sock.sendMessage(
        from,
        {
            text:
`┌──「 📊 *STATISTIK GRUP* 」
│
│  Total Pesan   : *${totalPesan}*
│  Total Anggota : *${totalAnggota}*
│  Aktif Chat    : *${aktifChat}*
│
└──────────────────`
        }
    )
}
    // !listchat
// !listchat
if (cmd === 'listchat') {

    const metadata =
        await sock.groupMetadata(from)

    const totalAnggota =
        metadata.participants.length

    const users =
        Object.values(data[from])
        .sort((a, b) =>
            b.count - a.count
        )

    const aktifChat =
        users.filter(
            u => u.count > 0
        ).length

    const totalPesan =
    users.reduce(
        (sum, u) =>
            sum + Number(u.count || 0),
        0
    )

    const belumChat =
        totalAnggota -
        aktifChat

    let text =
`┌──「 📊 *STATISTIK PESAN GRUP* 」
│
│  Total Pesan   : *${totalPesan}*
│  Total Anggota : *${totalAnggota}*
│  Aktif Chat    : *${aktifChat}*
│`

    const maxShow = 30

    users
    .filter(u => u.count > 0)
    .slice(0, maxShow)
    .forEach((u, i) => {

        text +=
`\n│  ${String(i + 1)
    .padStart(2, '0')}. ${u.name} — ${u.count} pesan`
    })

    if (aktifChat > maxShow) {

        text +=
`\n│  _...dan ${aktifChat - maxShow} anggota aktif lainnya_`
    }

    if (belumChat > 0) {

        text +=
`\n│  _...${belumChat} anggota belum pernah chat_`
    }

    text +=
`\n│
└──────────────────`

    return sock.sendMessage(
        from,
        { text }
    )
}

    // !resetchat
if (cmd === 'resetchat') {

    data[from] = {}

    saveData(data)

    return sock.sendMessage(
        from,
        {
            text:
`┌──「 ✅ *RESET CHAT* 」
│
│  Statistik chat grup
│  berhasil direset.
│
└──────────────────`
        }
    )
}
}module.exports = {
    addMessage,
    syncGroupMembers,
    handleMessageStats
}