// commands/gacha.js
const fs = require('fs');
const path = require('path');

// File data
const GACHA_POINTS_FILE = path.join(__dirname, '../data/gachapoints.json');
const GACHA_CARDS_FILE = path.join(__dirname, '../data/gacha.json');
const CARD_RARITY_FILE = path.join(__dirname, '../data/cardrarity.json');
// Folder tempat semua foto kartu disimpan
const ASSET_DIR = path.join(__dirname, '../assets/menu');
// File data poin dari game lain (tebak kata, dll)
const GAME_POINTS_FILE = path.join(__dirname, '../data/tebakkata.json');

// ================= Konfigurasi Rarity =================
const RARITY_ORDER = ['Common', 'Rare', 'Epic', 'Legendary'];

// Bobot kemunculan saat assign rarity pertama kali ke setiap kartu
const RARITY_ASSIGN_WEIGHTS = {
    Common: 60,
    Rare: 25,
    Epic: 12,
    Legendary: 3
};

const RARITY_EMOJI = {
    Common: '⚪',
    Rare: '🔵',
    Epic: '🟣',
    Legendary: '🟡'
};

// ================= Helper: Poin Gacha =================
function loadGachaPoints() {
    if (!fs.existsSync(GACHA_POINTS_FILE)) {
        fs.writeFileSync(GACHA_POINTS_FILE, JSON.stringify({}));
    }
    return JSON.parse(fs.readFileSync(GACHA_POINTS_FILE, 'utf8'));
}
function saveGachaPoints(data) {
    fs.writeFileSync(GACHA_POINTS_FILE, JSON.stringify(data, null, 2));
}
function getGachaPoints(userId) {
    const data = loadGachaPoints();
    return data[userId]?.points || 0;
}
function setGachaPoints(userId, points) {
    const data = loadGachaPoints();
    if (!data[userId]) data[userId] = {};
    data[userId].points = points;
    saveGachaPoints(data);
}
function addGachaPoints(userId, points) {
    const current = getGachaPoints(userId);
    setGachaPoints(userId, current + points);
}
function deductGachaPoints(userId, points) {
    const current = getGachaPoints(userId);
    if (current < points) return false;
    setGachaPoints(userId, current - points);
    return true;
}
function initGachaUser(userId) {
    const data = loadGachaPoints();
    if (!data[userId]) {
        data[userId] = { points: 1200 };
        saveGachaPoints(data);
    }
}

// ================= Helper: Kartu & Koleksi =================
function loadCardsCollection() {
    if (!fs.existsSync(GACHA_CARDS_FILE)) {
        fs.writeFileSync(GACHA_CARDS_FILE, JSON.stringify({}));
    }
    return JSON.parse(fs.readFileSync(GACHA_CARDS_FILE, 'utf8'));
}
function saveCardsCollection(data) {
    fs.writeFileSync(GACHA_CARDS_FILE, JSON.stringify(data, null, 2));
}
function getAllCards() {
    if (!fs.existsSync(ASSET_DIR)) return [];
    return fs.readdirSync(ASSET_DIR).filter(f => /\.(jpg|jpeg|png)$/i.test(f));
}
function getUserCards(userId) {
    const data = loadCardsCollection();
    return data[userId]?.cards || [];
}
// Hanya kartu yang masih benar-benar ada di folder assets/menu
function getUserCardsValid(userId, allCards) {
    return getUserCards(userId).filter(c => allCards.includes(c));
}
function addUserCard(userId, cardName, senderName) {
    const data = loadCardsCollection();
    if (!data[userId]) data[userId] = { name: senderName || '', cards: [] };
    if (senderName) data[userId].name = senderName;
    if (!data[userId].cards.includes(cardName)) {
        data[userId].cards.push(cardName);
    }
    saveCardsCollection(data);
}

// ================= Helper: Rarity Kartu =================
function loadCardRarity() {
    if (!fs.existsSync(CARD_RARITY_FILE)) {
        fs.writeFileSync(CARD_RARITY_FILE, JSON.stringify({}));
    }
    return JSON.parse(fs.readFileSync(CARD_RARITY_FILE, 'utf8'));
}
function saveCardRarity(data) {
    fs.writeFileSync(CARD_RARITY_FILE, JSON.stringify(data, null, 2));
}

// Pilih rarity acak berdasarkan bobot RARITY_ASSIGN_WEIGHTS
function randomRarity() {
    const entries = Object.entries(RARITY_ASSIGN_WEIGHTS);
    const total = entries.reduce((sum, [, w]) => sum + w, 0);
    let roll = Math.random() * total;
    for (const [rarity, weight] of entries) {
        if (roll < weight) return rarity;
        roll -= weight;
    }
    return RARITY_ORDER[0];
}

// Pastikan semua kartu di folder sudah punya rarity. Kartu baru akan
// di-assign rarity acak sekali, lalu disimpan permanen.
function ensureCardRarities(allCards) {
    const rarityData = loadCardRarity();
    let changed = false;

    for (const card of allCards) {
        if (!rarityData[card]) {
            rarityData[card] = randomRarity();
            changed = true;
        }
    }

    // Bersihkan entri untuk kartu yang sudah tidak ada di folder
    for (const card of Object.keys(rarityData)) {
        if (!allCards.includes(card)) {
            delete rarityData[card];
            changed = true;
        }
    }

    if (changed) saveCardRarity(rarityData);
    return rarityData;
}

function getCardRarity(rarityData, card) {
    return rarityData[card] || 'Common';
}

// ================= Helper: Poin Game (dari tebakkata.json) =================
function getGamePoints(userId) {
    if (!fs.existsSync(GAME_POINTS_FILE)) return 0;
    try {
        const data = JSON.parse(fs.readFileSync(GAME_POINTS_FILE, 'utf8'));
        if (data[userId]?.poin !== undefined) return data[userId].poin;
        if (data[userId]?.points !== undefined) return data[userId].points;
        for (const key in data) {
            if (data[key] && data[key][userId] && data[key][userId].poin !== undefined) {
                return data[key][userId].poin;
            }
        }
        return 0;
    } catch (e) {
        return 0;
    }
}
function deductGamePoints(userId, amount) {
    if (!fs.existsSync(GAME_POINTS_FILE)) return false;
    try {
        const data = JSON.parse(fs.readFileSync(GAME_POINTS_FILE, 'utf8'));
        let current = 0;
        if (data[userId]?.poin !== undefined) {
            current = data[userId].poin;
            if (current < amount) return false;
            data[userId].poin = current - amount;
            fs.writeFileSync(GAME_POINTS_FILE, JSON.stringify(data, null, 2));
            return true;
        }
        if (data[userId]?.points !== undefined) {
            current = data[userId].points;
            if (current < amount) return false;
            data[userId].points = current - amount;
            fs.writeFileSync(GAME_POINTS_FILE, JSON.stringify(data, null, 2));
            return true;
        }
        for (const groupId in data) {
            if (data[groupId] && data[groupId][userId] && data[groupId][userId].poin !== undefined) {
                current = data[groupId][userId].poin;
                if (current < amount) return false;
                data[groupId][userId].poin = current - amount;
                fs.writeFileSync(GAME_POINTS_FILE, JSON.stringify(data, null, 2));
                return true;
            }
        }
        return false;
    } catch (e) {
        return false;
    }
}

// ================= Handler Utama =================
async function handleGacha(sock, msg, from, cmd, args, senderName) {
    const userId = msg.key.participant || msg.key.remoteJid;
    initGachaUser(userId);

    const allCards = getAllCards();
    if (allCards.length === 0) {
        return sock.sendMessage(from, { text: '❌ Belum ada aset foto. Kirim foto ke bot (private chat) dulu.' });
    }

    const rarityData = ensureCardRarities(allCards);

    switch (cmd) {
        case 'gacha': {
            const points = getGachaPoints(userId);
            if (points < 100) {
                return sock.sendMessage(from, { text: `❌ Poin gacha tidak cukup! Punya ${points} poin. Butuh 100.\nKetik !convert [jumlah]` });
            }

            const owned = getUserCardsValid(userId, allCards);
            const available = allCards.filter(c => !owned.includes(c));
            if (available.length === 0) {
                return sock.sendMessage(from, { text: '🎉 Kamu sudah punya semua kartu! 🎉' });
            }

            const selectedCard = available[Math.floor(Math.random() * available.length)];
            const imagePath = path.join(ASSET_DIR, selectedCard);

            if (!fs.existsSync(imagePath)) {
                return sock.sendMessage(from, { text: `❌ File kartu tidak ditemukan: ${selectedCard}` });
            }

            let imageBuffer;
            try {
                imageBuffer = fs.readFileSync(imagePath);
                if (imageBuffer.length < 100) throw new Error('File corrupt');
            } catch (err) {
                return sock.sendMessage(from, { text: `❌ Kartu ${selectedCard} rusak. Coba lagi.` });
            }

            deductGachaPoints(userId, 100);
            addUserCard(userId, selectedCard, senderName);

            const newPoints = getGachaPoints(userId);
            const totalOwned = getUserCardsValid(userId, allCards).length;
            const rarity = getCardRarity(rarityData, selectedCard);
            const emoji = RARITY_EMOJI[rarity] || '⚪';

            const caption =
                `🎴 *GACHA PHOTOCARD* 🎴\n\n` +
                `Kamu mendapatkan:\n` +
                `📸 *${selectedCard}*\n` +
                `${emoji} Rarity: *${rarity}*\n\n` +
                `💎 Sisa poin: ${newPoints}\n` +
                `📦 Koleksi: ${totalOwned}/${allCards.length}`;

            await sock.sendMessage(from, { image: imageBuffer, caption: caption });
            break;
        }

        case 'mycards': {
            const owned = getUserCardsValid(userId, allCards);
            if (owned.length === 0) {
                return sock.sendMessage(from, { text: '📭 Kamu belum punya kartu. Ketik !gacha dulu!' });
            }

            let text = `📇 *KOLEKSI ${senderName}*\nTotal: ${owned.length}/${allCards.length}\n\n`;
            owned.forEach((card, idx) => {
                const rarity = getCardRarity(rarityData, card);
                const emoji = RARITY_EMOJI[rarity] || '⚪';
                text += `${idx + 1}. ${emoji} ${card} — ${rarity}\n`;
            });

            if (text.length > 4000) text = text.substring(0, 4000) + '\n... (terpotong)';
            return sock.sendMessage(from, { text });
        }

        case 'cardrank': {
            const cardsCol = loadCardsCollection();
            const ranked = Object.entries(cardsCol).map(([uid, val]) => {
                const validCards = (val.cards || []).filter(c => allCards.includes(c));
                return {
                    name: val.name || uid.split('@')[0],
                    total: validCards.length
                };
            }).sort((a, b) => b.total - a.total).slice(0, 10);

            if (ranked.length === 0) return sock.sendMessage(from, { text: 'Belum ada pemain.' });

            let text = '🏆 *PAPAN PERINGKAT KOLEKTOR* 🏆\n\n';
            ranked.forEach((u, i) => {
                text += `${i + 1}. ${u.name} — ${u.total} kartu\n`;
            });
            return sock.sendMessage(from, { text });
        }

        case 'gachapoin': {
            const points = getGachaPoints(userId);
            return sock.sendMessage(from, { text: `💎 *Poin Gacha Kamu:* ${points} poin.\nSetiap gacha = 100 poin.\nKetik !convert [jumlah] untuk tukar poin game.` });
        }

        case 'convert': {
            const amountGame = parseInt(args[0]);
            if (isNaN(amountGame) || amountGame <= 0) {
                return sock.sendMessage(from, { text: '❌ Masukkan jumlah poin game yang ingin ditukar. Contoh: !convert 50' });
            }

            const gamePoints = getGamePoints(userId);
            if (gamePoints < amountGame) {
                return sock.sendMessage(from, { text: `❌ Poin game kamu hanya ${gamePoints}. Tidak cukup untuk menukar ${amountGame}.` });
            }

            const gachaEarned = amountGame * 2;
            if (deductGamePoints(userId, amountGame)) {
                addGachaPoints(userId, gachaEarned);
                const newGachaPoints = getGachaPoints(userId);
                return sock.sendMessage(from, { text: `✅ Berhasil menukar ${amountGame} poin game menjadi ${gachaEarned} poin gacha!\n💎 Total poin gacha sekarang: ${newGachaPoints}` });
            } else {
                return sock.sendMessage(from, { text: '❌ Gagal menukar poin game. Coba lagi.' });
            }
        }

        default:
            return sock.sendMessage(from, { text: '❌ Subcommand tidak dikenal. Gunakan: !gacha, !mycards, !cardrank, !gachapoin, !convert [jumlah]' });
    }
}

module.exports = { handleGacha };