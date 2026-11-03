/**
 * A dictionary that preserves insertion order and is keyed by a string
 * derived from each item via `idGetter`.
 */
export declare function makeOrderedDictionary<T>(idGetter: (item: T) => string): {
    array: T[];
    dict: {
        [id: string]: T;
    };
    get: (id: string) => T | undefined;
    upsert: (item: T, mode: "append" | "prepend") => void;
    updateAssign: (id: string, update: Partial<T>) => boolean;
    remove: (item: T) => boolean;
    clear: () => void;
    filter: (predicate: (item: T) => boolean) => void;
    toJSON: () => T[];
    fromJSON: (items: T[]) => void;
};
//# sourceMappingURL=make-ordered-dictionary.d.ts.map