/**
 * Simple in-memory key-value repository backed by a Map.
 * Used by makeInMemoryStore to hold Labels.
 */
export declare class ObjectRepository<T extends object> {
    private readonly entityMap;
    constructor(entities?: Record<string, T>);
    findById(id: string): T | undefined;
    findAll(): T[];
    upsertById(id: string, entity: T): void;
    deleteById(id: string): boolean;
    count(): number;
    toJSON(): T[];
    fromJSON(items: {
        id: string;
        [key: string]: any;
    }[]): void;
}
//# sourceMappingURL=object-repository.d.ts.map