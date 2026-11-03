/**
 * A dictionary that preserves insertion order and is keyed by a string
 * derived from each item via `idGetter`.
 */
export function makeOrderedDictionary(idGetter) {
    const array = [];
    const dict = {};
    const get = (id) => dict[id];
    const upsert = (item, mode) => {
        const id = idGetter(item);
        const existing = dict[id];
        if (existing !== undefined) {
            const idx = array.findIndex(i => idGetter(i) === id);
            if (idx >= 0)
                array[idx] = item;
            dict[id] = item;
        }
        else {
            if (mode === 'append')
                array.push(item);
            else
                array.splice(0, 0, item);
            dict[id] = item;
        }
    };
    const updateAssign = (id, update) => {
        const item = dict[id];
        if (item === undefined)
            return false;
        Object.assign(item, update);
        const newId = idGetter(item);
        if (newId !== id) {
            delete dict[id];
            dict[newId] = item;
        }
        return true;
    };
    const remove = (item) => {
        const id = idGetter(item);
        const idx = array.findIndex(i => idGetter(i) === id);
        if (idx < 0)
            return false;
        array.splice(idx, 1);
        delete dict[id];
        return true;
    };
    const clear = () => {
        array.splice(0, array.length);
        for (const key of Object.keys(dict))
            delete dict[key];
    };
    const filter = (predicate) => {
        let i = 0;
        while (i < array.length) {
            const cur = array[i];
            if (!predicate(cur)) {
                delete dict[idGetter(cur)];
                array.splice(i, 1);
            }
            else {
                i++;
            }
        }
    };
    return {
        array,
        dict,
        get,
        upsert,
        updateAssign,
        remove,
        clear,
        filter,
        toJSON: () => array,
        fromJSON: (items) => {
            clear();
            for (const item of items)
                upsert(item, 'append');
        }
    };
}
//# sourceMappingURL=make-ordered-dictionary.js.map