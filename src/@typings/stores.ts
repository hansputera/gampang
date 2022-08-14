export type IStore<K, V> = {
    get(key: K): Promise<V> | V;
    set(key: K, value: V): Promise<void> | void;
    delete(key: K): Promise<void> | void;
    clear(): Promise<void> | void;
};
