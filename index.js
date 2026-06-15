require('dotenv').config()

const { makeWASocket, DisconnectReason } = require('@whiskeysockets/baileys')
const { Boom } = require('@hapi/boom')
const qrcode = require('qrcode-terminal')
const fs = require('fs')
const path = require('path')

const { useMongoAuthState } = require('./mongo-auth-state')
const { handleCommand } = require('./handler')
const { addMessage, syncGroupMembers } = require('./commands/messagecount')
const { handleGroupParticipants } = require('./commands/group')

// ─────────────────────────────────────────
// AUTO GROUP SCHEDULER
// ─────────────────────────────────────────

const AUTO_GROUP_FILE = path.join(__dirname, './data/autogroup.json')

function startAutoGroupScheduler(sock) {
    setInterval(async () => {
        try {
            if (!fs.existsSync(AUTO_GROUP_FILE)) return

            const data = JSON.parse(fs.readFileSync(AUTO_GROUP_FILE, 'utf8'))

            const now    = new Date()
            const jam    = String(now.getHours()).padStart(2, '0')
            const menit  = String(now.getMinutes()).padStart(2, '0')
            const waktu  = `${jam}:${menit}`

            console.log('[AUTO GROUP]', waktu)

            for (const groupId in data) {
                const config = data[groupId]

                if (!config.enabled) continue

                if (waktu === config.open) {
                    console.log('[AUTO GROUP] Buka:', groupId)
                    await sock.groupSettingUpdate(groupId, 'not_announcement')
                    await sock.sendMessage(groupId, { text: '🔓 Grup dibuka otomatis.' })
                }

                if (waktu === config.close) {
                    console.log('[AUTO GROUP] Tutup:', groupId)
                    await sock.groupSettingUpdate(groupId, 'announcement')
                    await sock.sendMessage(groupId, { text: '🔒 Grup ditutup otomatis.' })
                }
            }
        } catch (err) {
            console.error('[AUTO GROUP ERROR]', err)
        }
    }, 60000)
}

// ─────────────────────────────────────────
// MAIN BOT
// ─────────────────────────────────────────

async function startBot() {
    const { state, saveCreds } = await useMongoAuthState()

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false
    })

    // Simpan credentials saat update
    sock.ev.on('creds.update', saveCreds)

    // ── Koneksi ──────────────────────────
    sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
        if (qr) {
            console.log('\n📱 Scan QR berikut:\n')
            qrcode.generate(qr, { small: true })
        }

        if (connection === 'open') {
            console.log('✅ Bot terhubung!')
            startAutoGroupScheduler(sock)

            // Sync semua member grup saat bot nyala
            const groups = await sock.groupFetchAllParticipating()
            for (const id in groups) {
                await syncGroupMembers(id, groups[id].participants)
            }
        }

        if (connection === 'close') {
            const shouldReconnect =
                new Boom(lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut

            console.log('❌ Koneksi terputus')

            if (shouldReconnect) {
                console.log('🔄 Reconnecting...')
                startBot()
            } else {
                console.log('🚫 Logged out. Hapus folder auth_info dan scan ulang QR.')
            }
        }
    })

    // ── Peserta Grup Berubah ──────────────
    sock.ev.on('group-participants.update', async (update) => {
        try {
            await handleGroupParticipants(sock, update)

            if (['add', 'promote', 'demote'].includes(update.action)) {
                const metadata = await sock.groupMetadata(update.id)
                await syncGroupMembers(update.id, metadata.participants)
            }
        } catch (err) {
            console.error('[GROUP PARTICIPANT ERROR]', err)
        }
    })

    // ── Pesan Masuk ──────────────────────
    sock.ev.on('messages.upsert', async ({ messages }) => {
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

            const senderName = msg.pushName || 'Pemain'
            const senderId   = msg.key.participant || msg.key.remoteJid

            // Hitung statistik pesan grup
            if (from.endsWith('@g.us')) {
                addMessage(from, senderId, senderName)
            }

            console.log(`[MSG] ${from} : ${body}`)

            await handleCommand(sock, msg, from, body.trim(), senderName)
        } catch (err) {
            console.error('[MESSAGE ERROR]', err)
        }
    })
}

startBot()
