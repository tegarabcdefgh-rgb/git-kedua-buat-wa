// commands/intro.js
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const DATA_FILE = path.join(DATA_DIR, 'intro.json');

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
"Let's be close and spread positive vibes 🤍"
──────────────────────────`;

function loadIntroData() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, JSON.stringify({}));
    }
    try {
        return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    } catch (e) {
        return {};
    }
}

function saveIntroData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function isAdmin(participants, senderId) {
    const participant = participants.find(p => p.id === senderId);
    return participant && (participant.admin === 'admin' || participant.admin === 'superadmin');
}

function getRawText(msg) {
    return (
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        msg.message?.imageMessage?.caption ||
        msg.message?.videoMessage?.caption ||
        ''
    );
}

async function handleIntro(sock, msg, from, cmd, args, senderName) {
    if (!from.endsWith('@g.us')) {
        return sock.sendMessage(from, { text: '❌ Command ini hanya bisa digunakan di grup.' });
    }

    let introData = loadIntroData();

    // !intro → tampilkan intro grup ini
    if (cmd === 'intro') {
        const introText = introData[from] || DEFAULT_INTRO;
        return sock.sendMessage(from, { text: introText });
    }

    // !setintro [teks] → hanya admin
    if (cmd === 'setintro') {
        const metadata = await sock.groupMetadata(from);
        const senderId = msg.key.participant || msg.key.remoteJid;

        if (!isAdmin(metadata.participants, senderId)) {
            return sock.sendMessage(from, { text: '❌ Hanya admin grup yang bisa mengatur intro.' });
        }

        // Ambil raw text supaya newline tidak hilang
        const rawText = getRawText(msg);

        // Buang bagian "!setintro " di awal
        const introText = rawText.replace(/^[!./#]?setintro\s*/i, '').trim();

        if (!introText) {
            return sock.sendMessage(from, {
                text: '❌ Cara pakai: !setintro [teks intro]\nContoh: !setintro Selamat datang di grup ini!\n\n💡 Bisa multi-baris, tulis langsung dengan enter.'
            });
        }

        introData[from] = introText;
        saveIntroData(introData);
        return sock.sendMessage(from, { text: '✅ Intro grup berhasil diatur!' });
    }

    // !resetintro → hapus intro custom, balik ke default (hanya admin)
    if (cmd === 'resetintro') {
        const metadata = await sock.groupMetadata(from);
        const senderId = msg.key.participant || msg.key.remoteJid;

        if (!isAdmin(metadata.participants, senderId)) {
            return sock.sendMessage(from, { text: '❌ Hanya admin grup yang bisa mereset intro.' });
        }

        if (!introData[from]) {
            return sock.sendMessage(from, { text: 'ℹ️ Grup ini masih memakai intro default.' });
        }

        delete introData[from];
        saveIntroData(introData);
        return sock.sendMessage(from, { text: '✅ Intro grup berhasil direset ke format default Hearts2Hearts!' });
    }
}

module.exports = { handleIntro };