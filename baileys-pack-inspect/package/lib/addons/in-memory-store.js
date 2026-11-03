/**
 * addon: in-memory-store
 *
 * A minimal in-memory data store for chats, contacts, and messages —
 * reintroduced for developers who want a quick starting point without
 * building their own persistence layer from scratch.
 *
 * Important: for anything beyond quick prototyping, build your own store.
 * Keeping someone's entire chat history in memory is a lot of RAM for
 * not much benefit once your bot has real usage.
 */
import { readFileSync, writeFileSync } from 'fs';
/** Minimal KeyedDB-like wrapper so `.all()` reads naturally, like the old Baileys store. */
class KeyedCollection {
    constructor(keyFn) {
        this.keyFn = keyFn;
        this.map = new Map();
    }
    all() {
        return [...this.map.values()];
    }
    get(id) {
        return this.map.get(id);
    }
    upsert(...items) {
        for (const item of items) {
            const key = this.keyFn(item);
            this.map.set(key, { ...(this.map.get(key) || {}), ...item });
        }
    }
    update(...items) {
        for (const item of items) {
            const key = this.keyFn(item);
            const existing = this.map.get(key);
            if (existing)
                this.map.set(key, { ...existing, ...item });
        }
    }
    delete(id) {
        this.map.delete(id);
    }
    toJSON() {
        return this.all();
    }
    fromJSON(items) {
        this.map.clear();
        for (const item of items || []) {
            this.map.set(this.keyFn(item), item);
        }
    }
}
export const makeInMemoryStore = (config) => {
    const { logger, maxMessagesPerChat = 200 } = config || {};
    const chats = new KeyedCollection(c => c.id);
    const contacts = {};
    const messages = new Map();
    const upsertMessages = (jid, msgs) => {
        const arr = messages.get(jid) || [];
        for (const msg of msgs) {
            const idx = arr.findIndex(m => m.key.id === msg.key.id);
            if (idx >= 0)
                arr[idx] = msg;
            else
                arr.push(msg);
        }
        if (arr.length > maxMessagesPerChat) {
            arr.splice(0, arr.length - maxMessagesPerChat);
        }
        messages.set(jid, arr);
    };
    const bind = (ev) => {
        ev.on('chats.upsert', newChats => chats.upsert(...newChats));
        ev.on('chats.update', updates => chats.update(...updates));
        ev.on('chats.delete', ids => {
            for (const id of ids)
                chats.delete(id);
        });
        ev.on('contacts.upsert', newContacts => {
            for (const c of newContacts) {
                if (c.id)
                    contacts[c.id] = { ...contacts[c.id], ...c };
            }
        });
        ev.on('contacts.update', updates => {
            for (const c of updates) {
                if (c.id)
                    contacts[c.id] = { ...contacts[c.id], ...c };
            }
        });
        ev.on('messages.upsert', ({ messages: msgs }) => {
            const byJid = new Map();
            for (const msg of msgs) {
                const jid = msg.key.remoteJid;
                if (!jid)
                    continue;
                const arr = byJid.get(jid) || [];
                arr.push(msg);
                byJid.set(jid, arr);
            }
            for (const [jid, arr] of byJid)
                upsertMessages(jid, arr);
        });
        ev.on('messages.update', updates => {
            for (const { key, update } of updates) {
                const jid = key.remoteJid;
                if (!jid)
                    continue;
                const arr = messages.get(jid);
                const existing = arr?.find(m => m.key.id === key.id);
                if (existing)
                    Object.assign(existing, update);
            }
        });
        ev.on('messages.delete', item => {
            if ('all' in item && item.all) {
                messages.delete(item.jid);
                return;
            }
            const keys = item.keys;
            for (const key of keys) {
                const jid = key.remoteJid;
                if (!jid)
                    continue;
                const arr = messages.get(jid);
                if (!arr)
                    continue;
                const idx = arr.findIndex(m => m.key.id === key.id);
                if (idx >= 0)
                    arr.splice(idx, 1);
            }
        });
        logger?.debug?.('in-memory store bound to socket events');
    };
    const loadMessages = (jid, count) => {
        const arr = messages.get(jid) || [];
        return arr.slice(Math.max(0, arr.length - count));
    };
    const loadMessage = (jid, id) => {
        return messages.get(jid)?.find(m => m.key.id === id);
    };
    const writeToFile = (path) => {
        const json = {
            chats: chats.toJSON(),
            contacts,
            messages: Object.fromEntries(messages)
        };
        writeFileSync(path, JSON.stringify(json));
    };
    const readFromFile = (path) => {
        try {
            const json = JSON.parse(readFileSync(path, 'utf-8'));
            chats.fromJSON(json.chats || []);
            Object.assign(contacts, json.contacts || {});
            messages.clear();
            for (const [jid, arr] of Object.entries(json.messages || {})) {
                messages.set(jid, arr);
            }
        }
        catch (err) {
            logger?.warn?.({ err }, 'failed to read store from file');
        }
    };
    return { chats, contacts, messages, bind, readFromFile, writeToFile, loadMessages, loadMessage };
};
//# sourceMappingURL=in-memory-store.js.map