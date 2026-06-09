const fs = require('fs')
const path = require('path')

const FILE = path.join(__dirname, '../data/autogroup.json')

function loadData() {
    if (!fs.existsSync(FILE)) {
        fs.writeFileSync(FILE, JSON.stringify({}))
    }

    return JSON.parse(fs.readFileSync(FILE))
}

function saveData(data) {

    console.log('SAVE AUTOGROUP:')
    console.log(data)

    fs.writeFileSync(
        FILE,
        JSON.stringify(data, null, 2)
    )
}

async function startAutoGroup(sock) {

    setInterval(async () => {

        try {

            const data = loadData()

            const now = new Date()

            const jam =
                String(now.getHours()).padStart(2, '0')

            const menit =
                String(now.getMinutes()).padStart(2, '0')

            const waktu = `${jam}:${menit}`
            console.log('[AUTO GROUP]', waktu)
            console.log(data)
            for (const groupId in data) {

                const config = data[groupId]

                if (!config.enabled)
                    continue

                // buka jam 18:00
                if (waktu === '18:00') {

                    await sock.groupSettingUpdate(
                        groupId,
                        'not_announcement'
                    )

                    await sock.sendMessage(groupId, {
                        text:
'🔓 Grup dibuka otomatis.\n\nSelamat berdiskusi.'
                    })
                }

                // tutup jam 23:00
                if (waktu === '23:00') {

                    await sock.groupSettingUpdate(
                        groupId,
                        'announcement'
                    )

                    await sock.sendMessage(groupId, {
                        text:
'🔒 Grup ditutup otomatis.\n\nHanya admin yang dapat mengirim pesan.'
                    })
                }

            }

        } catch (err) {
            console.error(
                'AUTO GROUP ERROR:',
                err
            )
        }

    }, 60000)
}

module.exports = {
    startAutoGroup,
    loadData,
    saveData
}