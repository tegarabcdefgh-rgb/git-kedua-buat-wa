// commands/intro.js
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/intro.json');

// Default intro dengan format Hearts2Hearts
const DEFAULT_INTRO = `────────────────────
♡ 𝐇𝐄𝐀𝐑𝐓𝐒𝟐𝐇𝐄𝐀𝐑𝐓𝐒 𝐈𝐍𝐓𝐑𝐎 ♡
──────────────────────────
💌 Nama : 
🎂 Line (Tahun Lahir) : 
📍 Askot : 
💖 Bias : 
👥 Fangirl/fanboy :
💃🏻 Dapet link dr : 

              _*janlup baca desk yaw*_ 😊
──────────────────────────
“Let’s be close and spread positive vibes 🤍”
──────────────────────────`;

function loadIntroData() {
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, JSON.stringify({}));
    }
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function saveIntroData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function isAdmin(participants, senderId) {
    const participant = participants.find(p => p.id === senderId);
    return participant && (participant.admin === 'admin' || participant.admin === 'superadmin');
}

async function handleIntro(sock, msg, from, args, senderName) {
    if (!from.endsWith('@g.us')) {
        return sock.sendMessage(from, { text: '❌ Command ini hanya bisa digunakan di grup.' });
    }

    const cmd = args[0] ? args[0].toLowerCase() : '';
    let introData = loadIntroData();

    // !intro (tanpa argumen) → tampilkan intro
    if (cmd === '' && args.length === 0) {
        let introText = introData[from];
        // Jika belum ada intro untuk grup ini, gunakan default
        if (!introText) {
            introText = DEFAULT_INTRO;
        }
        return sock.sendMessage(from, { text: introText });
    }

    // !setintro [teks] → hanya admin yang bisa mengubah
    if (cmd === 'setintro') {
        const metadata = await sock.groupMetadata(from);
        const senderId = msg.key.participant || msg.key.remoteJid;
        
        if (!isAdmin(metadata.participants, senderId)) {
            return sock.sendMessage(from, { text: '❌ Hanya admin grup yang bisa mengatur intro.' });
        }

        const introText = args.slice(1).join(' ');
        if (!introText) {
            return sock.sendMessage(from, { text: '❌ Cara pakai: !setintro [teks intro]\nContoh: !setintro Selamat datang di grup ini!' });
        }

        introData[from] = introText;
        saveIntroData(introData);
        return sock.sendMessage(from, { text: '✅ Intro grup berhasil diatur!' });
    }

    // !resetintro → reset ke format default (hanya admin)
    if (cmd === 'resetintro') {
        const metadata = await sock.groupMetadata(from);
        const senderId = msg.key.participant || msg.key.remoteJid;
        
        if (!isAdmin(metadata.participants, senderId)) {
            return sock.sendMessage(from, { text: '❌ Hanya admin grup yang bisa mereset intro.' });
        }

        // Hapus intro custom, nanti akan pakai default
        delete introData[from];
        saveIntroData(introData);
        return sock.sendMessage(from, { text: '✅ Intro grup berhasil direset ke format default Hearts2Hearts!' });
    }

    // Perintah tidak dikenal
    return sock.sendMessage(from, { text: `❌ Perintah intro tidak dikenal.\n\n📌 *Cara penggunaan:*\n!intro - tampilkan intro\n!setintro [teks] - atur intro (admin)\n!resetintro - reset ke format default (admin)` });
}

module.exports = { handleIntro };