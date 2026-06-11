require('dotenv').config()
const {makeWASocket, useMultiFileAuthState,DisconnectReason } = require('@whiskeysockets/baileys')

const { Boom } = require('@hapi/boom')
const qrcode = require('qrcode-terminal')
const fs = require('fs')
const path = require('path')
const { handleCommand } = require('./handler')
const { startAutoGroup } = require('./lib/autogroup')
const {addMessage,syncGroupMembers} = require('./commands/messagecount')
function startAutoGroupScheduler(sock) {

    setInterval(async () => {

        try {

            const file = path.join(
                __dirname,
                './data/autogroup.json'
            )

            if (!fs.existsSync(file))
                return

            const data = JSON.parse(
              fs.readFileSync(file, 'utf8')
            )
            console.log('AUTOGROUP DATA:')
            console.log(data)

            const now = new Date()

            const jam =
                String(now.getHours())
                    .padStart(2, '0')

            const menit =
                String(now.getMinutes())
                    .padStart(2, '0')

            const waktu =
                `${jam}:${menit}`

            console.log(
                '[AUTO GROUP]',
                waktu
            )

            for (const groupId in data) {

                const config = data[groupId]
                console.log(
                    'NOW:',waktu,  '| OPEN:', data[groupId].open, '| CLOSE:',  data[groupId].close
                  )
                if (!config.enabled)
                    continue

                // buka grup
                if (waktu === config.open) {

                    console.log(
                        '[AUTO GROUP] Buka:',
                        groupId
                    )

                    await sock.groupSettingUpdate(
                        groupId,
                        'not_announcement'
                    )

                    await sock.sendMessage(
                        groupId,
                        {
                            text:
                            '🔓 Grup dibuka otomatis.'
                        }
                    )
                }

                // tutup grup
                if (waktu === config.close) {

                    console.log(
                        '[AUTO GROUP] Tutup:',
                        groupId
                    )

                    await sock.groupSettingUpdate(
                        groupId,
                        'announcement'
                    )

                    await sock.sendMessage(
                        groupId,
                        {
                            text:
                            '🔒 Grup ditutup otomatis.'
                        }
                    )
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
async function startBot() {

    const { state, saveCreds } =
        await useMultiFileAuthState('./auth_info')

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false
    })

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('connection.update', async ({
        connection,
        lastDisconnect,
        qr
    }) => {

        if (qr) {
            console.log('\n📱 Scan QR berikut:\n')
            qrcode.generate(qr, { small: true })
        }

if (connection === 'open') {

    console.log('✅ Bot terhubung!')

    startAutoGroupScheduler(sock)

    const groups = await sock.groupFetchAllParticipating()

    for (const id in groups) {

        await syncGroupMembers(
            id,
            groups[id].participants
        )
    }
}
        if (connection === 'close') {

            const shouldReconnect =
                new Boom(lastDisconnect?.error)
                    ?.output?.statusCode !==
                DisconnectReason.loggedOut

            console.log('❌ Koneksi terputus')

            if (shouldReconnect) {
                console.log('🔄 Reconnecting...')
                startBot()
            }
        }
    })

    sock.ev.on(
    'group-participants.update',
    async (update) => {
        try {

            const { handleGroupParticipants } =
                require('./commands/group')

            await handleGroupParticipants(
                sock,
                update
            )

            const {
                syncGroupMembers
            } = require('./commands/messagecount')

            if (
                update.action === 'add' ||
                update.action === 'promote' ||
                update.action === 'demote'
            ) {

                const metadata =
                    await sock.groupMetadata(
                        update.id
                    )

                await syncGroupMembers(
                    update.id,
                    metadata.participants
                )
            }

        } catch (err) {

            console.error(
                'Group Participant Error:',
                err
            )
        }
    }
)

    sock.ev.on(
    'messages.upsert',
    async ({ messages }) => {
        try {

            const msg = messages[0]

            if (!msg?.message) return
            if (msg.key.fromMe) return

            const from = msg.key.remoteJid

            const body =
                msg.message.conversation ||
                msg.message.extendedTextMessage?.text ||
                msg.message.imageMessage?.caption ||
                msg.message.videoMessage?.caption ||
                ''

            const senderName =
                msg.pushName || 'Pemain'

            const senderId =
                msg.key.participant ||
                msg.key.remoteJid

            // hitung pesan grup
            if (from.endsWith('@g.us')) {

                addMessage(
                    from,
                    senderId,
                    senderName
                )
            }

            console.log(
                `[MSG] ${from} : ${body}`
            )

            await handleCommand(
                sock,
                msg,
                from,
                body.trim(),
                senderName
            )

        } catch (err) {

            console.error(
                'Message Error:',
                err
            )
        }
    }
)
}

startBot()