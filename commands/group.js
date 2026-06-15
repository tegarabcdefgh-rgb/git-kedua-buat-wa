// Command yang hanya boleh dipakai admin grup (rawan bikin keributan jika dipakai sembarang orang)
const ADMIN_ONLY_COMMANDS = ['kick', 'add', 'promote', 'demote', 'mute', 'unmute', 'resetlink', 'tagall']

// Cek apakah sender adalah admin grup
async function isSenderAdmin(metadata, msg) {
    const sender = msg.key.participant || msg.key.remoteJid
    const participant = metadata.participants.find(p => p.id === sender)
    return participant?.admin === 'admin' || participant?.admin === 'superadmin'
}

async function handleGroup(sock, msg, from, cmd, args) {

    if (!from.endsWith('@g.us')) {
        return sock.sendMessage(from, {
            text: '❌ Command ini hanya bisa digunakan di grup.'
        })
    }

    try {

        const metadata = await sock.groupMetadata(from)

        // ── Cek admin untuk command yang berpotensi bikin keributan ──
        if (ADMIN_ONLY_COMMANDS.includes(cmd)) {
            const senderIsAdmin = await isSenderAdmin(metadata, msg)
            if (!senderIsAdmin) {
                return sock.sendMessage(from, {
                    text: `❌ Command *!${cmd}* hanya bisa digunakan oleh *admin grup*.`
                })
            }
        }

        switch (cmd) {

            case 'grupinfo': {

                const admins = metadata.participants.filter(
                    p => p.admin !== null
                )

                return sock.sendMessage(from, {
                    text:
`📋 INFO GRUP

📛 Nama: ${metadata.subject}
👥 Member: ${metadata.participants.length}
👑 Admin: ${admins.length}
📝 Deskripsi:
${metadata.desc || 'Tidak ada deskripsi'}`
                })
            }

            case 'tagall': {

                const mentions = metadata.participants.map(
                    p => p.id
                )

                let text = '📢 TAG ALL\n\n'

                for (const user of mentions) {
                    text += `@${user.split('@')[0]}\n`
                }

                return sock.sendMessage(from, {
                    text,
                    mentions
                })
            }

            case 'link': {

                const code =
                    await sock.groupInviteCode(from)

                return sock.sendMessage(from, {
                    text:
                        `🔗 Link Grup:\n\nhttps://chat.whatsapp.com/${code}`
                })
            }

            case 'resetlink': {

                await sock.groupRevokeInvite(from)

                return sock.sendMessage(from, {
                    text: '✅ Link grup berhasil direset.'
                })
            }

            case 'mute': {

                await sock.groupSettingUpdate(
                    from,
                    'announcement'
                )

                return sock.sendMessage(from, {
                    text:
                        '🔇 Grup ditutup.\nHanya admin yang dapat mengirim pesan.'
                })
            }

            case 'unmute': {

                await sock.groupSettingUpdate(
                    from,
                    'not_announcement'
                )

                return sock.sendMessage(from, {
                    text:
                        '🔊 Grup dibuka.\nSemua anggota dapat mengirim pesan.'
                })
            }

            case 'kick': {

                const mentioned =
                    msg.message?.extendedTextMessage
                        ?.contextInfo?.mentionedJid || []

                if (!mentioned.length) {
                    return sock.sendMessage(from, {
                        text: '❌ Tag member yang ingin dikeluarkan.'
                    })
                }

                await sock.groupParticipantsUpdate(
                    from,
                    mentioned,
                    'remove'
                )

                return sock.sendMessage(from, {
                    text: '✅ Member berhasil dikeluarkan.'
                })
            }

            case 'promote': {

                const mentioned =
                    msg.message?.extendedTextMessage
                        ?.contextInfo?.mentionedJid || []

                if (!mentioned.length) {
                    return sock.sendMessage(from, {
                        text: '❌ Tag member yang ingin dijadikan admin.'
                    })
                }

                await sock.groupParticipantsUpdate(
                    from,
                    mentioned,
                    'promote'
                )

                return sock.sendMessage(from, {
                    text: '✅ Member berhasil dijadikan admin.'
                })
            }

            case 'demote': {

                const mentioned =
                    msg.message?.extendedTextMessage
                        ?.contextInfo?.mentionedJid || []

                if (!mentioned.length) {
                    return sock.sendMessage(from, {
                        text: '❌ Tag admin yang ingin dicopot.'
                    })
                }

                await sock.groupParticipantsUpdate(
                    from,
                    mentioned,
                    'demote'
                )

                return sock.sendMessage(from, {
                    text: '✅ Admin berhasil dicopot.'
                })
            }

            case 'add': {

                if (!args[0]) {
                    return sock.sendMessage(from, {
                        text:
                            '❌ Contoh:\n!add 628123456789'
                    })
                }

                const number =
                    args[0].replace(/[^0-9]/g, '') +
                    '@s.whatsapp.net'

                await sock.groupParticipantsUpdate(
                    from,
                    [number],
                    'add'
                )

                return sock.sendMessage(from, {
                    text: '✅ Member berhasil ditambahkan.'
                })
            }

            default:
                return
        }

    } catch (err) {

        console.error(err)

        return sock.sendMessage(from, {
            text: '❌ Error:\n' + err.message
        })
    }
}

// Welcome & Goodbye
async function handleGroupParticipants(
    sock,
    update
) {

    const { id, participants, action } = update

    try {

        const metadata =
            await sock.groupMetadata(id)

        if (action === 'add') {

            for (const user of participants) {

                await sock.sendMessage(id, {
                    text:
                        `👋 Selamat datang @${user.split('@')[0]}\n\n` +
                        `Selamat bergabung di *${metadata.subject}*`,
                    mentions: [user]
                })
            }
        }

        if (action === 'remove') {

            for (const user of participants) {

                await sock.sendMessage(id, {
                    text:
                        `👋 Sampai jumpa @${user.split('@')[0]}`,
                    mentions: [user]
                })
            }
        }

    } catch (err) {
        console.error(err)
    }
}

module.exports = {
    handleGroup,
    handleGroupParticipants
}