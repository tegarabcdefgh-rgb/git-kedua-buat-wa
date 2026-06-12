const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/warn.json');

function loadWarnData() {
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, JSON.stringify({}));
    }
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function saveWarnData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

async function handleWarn(sock, msg, from, cmd, args, senderName) {
    if (!from.endsWith('@g.us')) {
        return sock.sendMessage(from, { text: '❌ Command ini hanya bisa digunakan di grup.' });
    }

    try {
        const metadata = await sock.groupMetadata(from);
        const senderId = msg.key.participant || msg.key.remoteJid;

        // Cek apakah pengirim adalah admin
        const isAdmin = metadata.participants.some(p => p.id === senderId && (p.admin === 'admin' || p.admin === 'superadmin'));
        if (!isAdmin) {
            return sock.sendMessage(from, { text: '❌ Hanya admin grup yang bisa menggunakan command warn.' });
        }

        const warnData = loadWarnData();

        switch (cmd) {
            case 'warn': {
                const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
                if (mentioned.length === 0) {
                    return sock.sendMessage(from, { text: '❌ Tag member yang ingin diberi warning.\nContoh: !warn @user alasan' });
                }
                const targetId = mentioned[0];
                const target = metadata.participants.find(p => p.id === targetId);
                if (!target) return sock.sendMessage(from, { text: '❌ Member tidak ditemukan.' });
                const reason = args.slice(1).join(' ') || 'Tidak ada alasan';

                if (!warnData[from]) warnData[from] = {};
                if (!warnData[from].users) warnData[from].users = {};
                if (!warnData[from].users[targetId]) {
                    warnData[from].users[targetId] = { name: target.notify || targetId.split('@')[0], warns: [] };
                }
                const userWarn = warnData[from].users[targetId];
                userWarn.warns.push({ reason, date: new Date().toLocaleString(), by: senderId });
                const total = userWarn.warns.length;
                const limit = warnData[from].limit || 3;
                saveWarnData(warnData);

                let message = `⚠️ *WARNING* ⚠️\n\n@${targetId.split('@')[0]} mendapat peringatan!\nAlasan: ${reason}\nSekarang: ${total}/${limit}`;
                if (total >= limit) {
                    try {
                        await sock.groupParticipantsUpdate(from, [targetId], 'remove');
                        message += `\n\n❌ *@${targetId.split('@')[0]} telah dikeluarkan karena melebihi batas warning (${limit}).*`;
                        delete warnData[from].users[targetId];
                        saveWarnData(warnData);
                    } catch (err) {
                        message += `\n\n⚠️ Gagal mengeluarkan member: ${err.message}`;
                    }
                }
                return sock.sendMessage(from, { text: message, mentions: [targetId] });
            }

            case 'unwarn': {
                const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
                if (mentioned.length === 0) return sock.sendMessage(from, { text: '❌ Tag member yang ingin dihapus warningnya.' });
                const targetId = mentioned[0];
                if (!warnData[from]?.users?.[targetId]) {
                    return sock.sendMessage(from, { text: `ℹ️ @${targetId.split('@')[0]} tidak memiliki warning.` });
                }
                const userWarn = warnData[from].users[targetId];
                userWarn.warns.pop();
                if (userWarn.warns.length === 0) delete warnData[from].users[targetId];
                saveWarnData(warnData);
                return sock.sendMessage(from, { text: `✅ Warning untuk @${targetId.split('@')[0]} dikurangi. Sekarang: ${userWarn.warns.length} warning.` });
            }

            case 'resetwarn': {
                const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
                if (mentioned.length === 0) return sock.sendMessage(from, { text: '❌ Tag member yang ingin direset warningnya.' });
                const targetId = mentioned[0];
                if (!warnData[from]?.users?.[targetId]) {
                    return sock.sendMessage(from, { text: `ℹ️ @${targetId.split('@')[0]} tidak memiliki warning.` });
                }
                delete warnData[from].users[targetId];
                saveWarnData(warnData);
                return sock.sendMessage(from, { text: `✅ Semua warning untuk @${targetId.split('@')[0]} telah direset.` });
            }

            case 'checkwarn': {
                const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
                if (mentioned.length === 0) return sock.sendMessage(from, { text: '❌ Tag member yang ingin diperiksa.' });
                const targetId = mentioned[0];
                const userWarn = warnData[from]?.users?.[targetId];
                const limit = warnData[from]?.limit || 3;
                if (!userWarn || userWarn.warns.length === 0) {
                    return sock.sendMessage(from, { text: `ℹ️ @${targetId.split('@')[0]} tidak memiliki warning.` });
                }
                let text = `📋 *INFO WARNING* 📋\n\n👤 Member: @${targetId.split('@')[0]}\n⚠️ Total: ${userWarn.warns.length}/${limit}\n\n📜 *Daftar Warning:*\n`;
                userWarn.warns.forEach((w, i) => {
                    text += `${i+1}. ${w.reason} (${w.date})\n`;
                });
                return sock.sendMessage(from, { text, mentions: [targetId] });
            }

            case 'setwarnlimit': {
                const limit = parseInt(args[0]);
                if (isNaN(limit) || limit < 1) return sock.sendMessage(from, { text: '❌ Masukkan angka valid (minimal 1). Contoh: !setwarnlimit 5' });
                if (!warnData[from]) warnData[from] = {};
                warnData[from].limit = limit;
                saveWarnData(warnData);
                return sock.sendMessage(from, { text: `✅ Batas maksimal warning untuk grup ini diubah menjadi *${limit}*.` });
            }

            case 'warnlimit': {
                const limit = warnData[from]?.limit || 3;
                return sock.sendMessage(from, { text: `⚠️ Batas maksimal warning untuk grup ini adalah *${limit}*.` });
            }

            default:
                return sock.sendMessage(from, { text: `📌 *COMMAND WARNING* (hanya admin)\n\n!warn @user [alasan] - beri peringatan\n!unwarn @user - hapus 1 peringatan terakhir\n!resetwarn @user - hapus semua peringatan\n!checkwarn @user - lihat detail peringatan\n!setwarnlimit <angka> - ubah batas maks warning\n!warnlimit - lihat batas warning grup` });
        }
    } catch (err) {
        console.error('Error di warn:', err);
        return sock.sendMessage(from, { text: '❌ Terjadi kesalahan. Pastikan bot memiliki akses admin ke grup.' });
    }
}

module.exports = { handleWarn };