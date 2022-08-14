export type IStore<K, V> = {
  get(key: K): V | Promise<V>;
  set(key: K, value: V): void | Promise<void>;
  delete(key: K): void | Promise<void>;
  clear(): void | Promise<void>;
};
