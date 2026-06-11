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

    data[groupId][userId].name =
        userName

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
`📨 Total Pesan

👤 ${
user?.name || 'Kamu'
}

📊 ${total} pesan`
            }
        )
    }

    // !topchat
    if (cmd === 'topchat') {

        const ranking =
            Object.values(
                data[from]
            )
            .sort(
                (a,b)=>
                b.count-a.count
            )

        let text =
`🏆 TOP CHAT GRUP

`

        ranking
        .slice(0,10)
        .forEach((u,i)=>{

            text +=
`${i+1}. ${u.name}
📨 ${u.count}

`
        })

        return sock.sendMessage(
            from,
            { text }
        )
    }

    // !totalgrup
    if (cmd === 'totalgrup') {

        const users =
            Object.values(
                data[from]
            )

        let totalPesan = 0

        users.forEach(u=>{
            totalPesan += u.count
        })

        return sock.sendMessage(
            from,
            {
                text:
`📊 Statistik Grup

👥 Total Member:
${users.length}

📨 Total Pesan:
${totalPesan}`
            }
        )
    }

    // !listchat
    if (cmd === 'listchat') {

        const users =
            Object.values(
                data[from]
            )
            .sort(
                (a,b)=>
                b.count-a.count
            )

        let text =
`📨 LIST CHAT MEMBER

`

        users.forEach((u,i)=>{

            text +=
`${i+1}. ${u.name}
📨 ${u.count}

`
        })

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
'✅ Statistik chat berhasil direset'
            }
        )
    }
}

module.exports = {
    addMessage,
    syncGroupMembers,
    handleMessageStats
}