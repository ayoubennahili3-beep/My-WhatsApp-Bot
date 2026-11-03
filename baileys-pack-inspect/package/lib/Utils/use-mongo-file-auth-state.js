import { proto } from '../../WAProto/index.js';
import { initAuthCreds } from './auth-utils.js';
import { BufferJSON } from './generics.js';
/**
 * MongoDB auth state — stores Baileys credentials in a MongoDB collection.
 * Pass a MongoDB collection instance (e.g. from mongoose or native driver).
 */
export const useMongoFileAuthState = async (collection) => {
    const writeData = (data, id) => {
        const informationToStore = JSON.parse(JSON.stringify(data, BufferJSON.replacer));
        return collection.updateOne({ _id: id }, { $set: { ...informationToStore } }, { upsert: true });
    };
    const readData = async (id) => {
        try {
            const data = JSON.stringify(await collection.findOne({ _id: id }));
            return JSON.parse(data, BufferJSON.reviver);
        }
        catch (err) {
            return null;
        }
    };
    const removeData = async (id) => {
        try {
            await collection.deleteOne({ _id: id });
        }
        catch { }
    };
    const creds = (await readData('creds')) || initAuthCreds();
    return {
        state: {
            creds,
            keys: {
                get: async (type, ids) => {
                    const data = {};
                    await Promise.all(ids.map(async (id) => {
                        let value = await readData(`${type}-${id}`);
                        if (type === 'app-state-sync-key' && value) {
                            value = proto.Message.AppStateSyncKeyData.fromObject(value);
                        }
                        data[id] = value;
                    }));
                    return data;
                },
                set: async (data) => {
                    const tasks = [];
                    for (const category of Object.keys(data)) {
                        for (const id of Object.keys(data[category])) {
                            const value = data[category][id];
                            const key = `${category}-${id}`;
                            tasks.push(value ? writeData(value, key) : removeData(key));
                        }
                    }
                    await Promise.all(tasks);
                }
            }
        },
        saveCreds: () => writeData(creds, 'creds')
    };
};
//# sourceMappingURL=use-mongo-file-auth-state.js.map