/**
 * Simple in-memory key-value repository backed by a Map.
 * Used by makeInMemoryStore to hold Labels.
 */
export class ObjectRepository {
    constructor(entities = {}) {
        this.entityMap = new Map(Object.entries(entities));
    }
    findById(id) {
        return this.entityMap.get(id);
    }
    findAll() {
        return Array.from(this.entityMap.values());
    }
    upsertById(id, entity) {
        this.entityMap.set(id, { ...entity });
    }
    deleteById(id) {
        return this.entityMap.delete(id);
    }
    count() {
        return this.entityMap.size;
    }
    toJSON() {
        return this.findAll();
    }
    fromJSON(items) {
        this.entityMap.clear();
        for (const item of items) {
            this.entityMap.set(item.id, item);
        }
    }
}
//# sourceMappingURL=object-repository.js.map