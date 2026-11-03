import type { AuthenticationState } from '../Types/index.js';
type MongoCollection = {
    findOne(filter: object): Promise<any>;
    updateOne(filter: object, update: object, options?: object): Promise<any>;
    deleteOne(filter: object): Promise<any>;
};
/**
 * MongoDB auth state — stores Baileys credentials in a MongoDB collection.
 * Pass a MongoDB collection instance (e.g. from mongoose or native driver).
 */
export declare const useMongoFileAuthState: (collection: MongoCollection) => Promise<{
    state: AuthenticationState;
    saveCreds: () => Promise<void>;
}>;
export {};
//# sourceMappingURL=use-mongo-file-auth-state.d.ts.map