// commands/gacha.js
const fs = require('fs');
const path = require('path');
const dataFile = path.join(__dirname, '../data/gacha.json');

function loadData() {
    if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, '{}');
    return JSON.parse(fs.readFileSync(dataFile));
}
function saveData(data) { fs.writeFileSync(dataFile, JSON.stringify(data, null, 2)); }

async function handleGacha(sock, msg, from, args, senderName) {
    const userId = msg.key.participant || msg.key.remoteJid;
    let data = loadData();
    if (!data[userId]) data[userId] = { name: senderName, cards: [] };

    const menuDir = path.join(__dirname, '../assets/menu');
    let images = fs.readdirSync(menuDir).filter(f => /\.(jpg|jpeg|png)$/i.test(f));
    if (!images.length) return sock.sendMessage(from, { text: '❌ Belum ada aset foto. Kirim foto ke bot dulu.' });

    // Hapus kartu yang sudah dimiliki
    let available = images.filter(img => !data[userId].cards.includes(img));
    if (available.length === 0) return sock.sendMessage(from, { text: '🎉 Selamat! Kamu sudah mengoleksi semua kartu!' });

    const randomCard = available[Math.floor(Math.random() * available.length)];
    const imageBuffer = fs.readFileSync(path.join(menuDir, randomCard));
    data[userId].cards.push(randomCard);
    saveData(data);

    await sock.sendMessage(from, {
        image: imageBuffer,
        caption: `🎴 *GACHA PHOTOCARD* 🎴\n\nKamu mendapatkan kartu:\n📸 *${randomCard}*\n\nKoleksi: ${data[userId].cards.length}/${images.length}`
    });
}

module.exports = { handleGacha };