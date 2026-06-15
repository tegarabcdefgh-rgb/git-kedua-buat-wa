const { MongoClient } = require('mongodb');
const { initAuthCreds } = require('@whiskeysockets/baileys');

const MONGODB_URI = process.env.MONGODB_URI;
const COLLECTION_NAME = 'baileys_auth';

if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is required for MongoDB session storage');
}

let client;
let database;
const locks = new Map();

const lock = async (key, fn) => {
    const previous = locks.get(key) || Promise.resolve();
    let release;
    const next = new Promise((resolve) => { release = resolve; });
    locks.set(key, next);

    try {
        await previous;
        return await fn();
    } finally {
        release();
        if (locks.get(key) === next) {
            locks.delete(key);
        }
    }
};

const getDatabaseName = () => {
    try {
        const url = new URL(MONGODB_URI);
        const path = url.pathname?.replace(/^\//, '');
        return path || 'baileys';
    }
    catch {
        return 'baileys';
    }
};

const connectMongo = async () => {
    if (!client) {
        client = new MongoClient(MONGODB_URI);
    }

    await client.connect();

    if (!database) {
        database = client.db(getDatabaseName());
    }
    return database;
};

const getCollection = async () => {
    const db = await connectMongo();
    return db.collection(COLLECTION_NAME);
};

const fixFileName = (file) => file?.replace(/\//g, '__').replace(/:/g, '-');

const readData = async (file) => {
    const collection = await getCollection();
    const key = fixFileName(file);
    const doc = await collection.findOne({ _id: key });
    if (!doc?.value) return null;
    return JSON.parse(doc.value);
};

const writeData = async (data, file) => {
    const collection = await getCollection();
    const key = fixFileName(file);
    const value = JSON.stringify(data);
    await collection.updateOne(
        { _id: key },
        { $set: { value, updatedAt: new Date() } },
        { upsert: true }
    );
};

const removeData = async (file) => {
    const collection = await getCollection();
    const key = fixFileName(file);
    await collection.deleteOne({ _id: key });
};

const readAuthData = async (file) => {
    return lock(file, async () => {
        return readData(file);
    });
};

const writeAuthData = async (data, file) => {
    return lock(file, async () => {
        return writeData(data, file);
    });
};

const deleteAuthData = async (file) => {
    return lock(file, async () => {
        return removeData(file);
    });
};

const clearAuthData = async () => {
    const collection = await getCollection();
    await collection.deleteMany({});
};

const useMongoAuthState = async () => {
    const creds = (await readAuthData('creds.json')) || initAuthCreds();

    return {
        state: {
            creds,
            keys: {
                get: async (type, ids) => {
                    const data = {};
                    await Promise.all(ids.map(async (id) => {
                        const stored = await readAuthData(`${type}-${id}.json`);
                        data[id] = stored;
                    }));
                    return data;
                },
                set: async (data) => {
                    const tasks = [];
                    for (const category in data) {
                        for (const id in data[category]) {
                            const value = data[category][id];
                            const file = `${category}-${id}.json`;
                            if (value) {
                                tasks.push(writeAuthData(value, file));
                            } else {
                                tasks.push(deleteAuthData(file));
                            }
                        }
                    }
                    await Promise.all(tasks);
                }
            }
        },
        saveCreds: async () => {
            return writeAuthData(creds, 'creds.json');
        },
        clear: async () => {
            return clearAuthData();
        }
    };
};

module.exports = { useMongoAuthState };