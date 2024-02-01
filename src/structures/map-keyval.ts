import { IStore } from '../@typings';

/**
 * @class DataStoreKeyValMap
 */
export class DataStoreKeyValMap<K, V> implements IStore<K, V> {
  private $map: Map<K, V>;

  /**
   * @constructor
   */
  constructor() {
    this.$map = new Map();
  }

  /**
   * Get the contents of the map
   * @param {string} key A key
   * @return {V}
   */
  get(key: K): V | undefined {
    return this.$map.get(key);
  }

  /**
   * Sets a value to the map
   * @param {K} key A key
   * @param {V} value A value
   * @return {void}
   */
  set(key: K, value: V): void {
    this.$map.set(key, value);
  }

  /**
   * Deletes a key from the map
   * @param {K} key A key
   * @return {void}
   */
  delete(key: K): void {
    this.$map.delete(key);
  }

  /**
   * Clears the map
   */
  clear(): void {
    this.$map.clear();
  }
}
