export interface iDisctionary<T extends string | number | symbol> {
    [index: string]: T;
}
export declare function isMap(x: any): x is Map<any, any>;
export declare function toObject(map: Map<any, any>): Object;
export declare function isObject(x: any): boolean;
/***
 * if recursive , returns Map<K,Map<K,V>> insteads of Map<K,V>
 * flattens Objects to maps
 */
export declare function toMap<TKey>(obj: iDisctionary<any>, recursive?: boolean): Map<TKey, any>;
export declare function serializeMapSync<K, V>(map: Map<K, V>): string;
export declare function serializeToFileSync<K, V>(filePath: string, map: Map<K, V>): void;
export declare function serializeToFile<K, V>(filePath: string, map: Map<K, V>): Promise<any>;
export declare function deserialize<K, V>(text: string): Map<K, V>;
/***
 * if recursive , returns nested Maps <Map<K,Map<K,V>>...>
 */
export declare function deserializeFromFileSync<K, V>(filePath: string, recursive?: boolean): Map<K, V>;
/**
 * Recursive?
 */
export declare function deserializeFromFile<K, V>(filePath: string, recursive?: boolean): Promise<Map<K, V>>;
export declare function toMaps<T, TKey>(key: (target: T) => TKey, targets: T[]): Map<TKey, Map<string, any>>;
export declare function fromMap<T, TKey>(type: {
    new (): T;
}, map: Map<TKey, any>): T;
export declare function fromMaps<T, TKey>(type: {
    new (): T;
}, maps: IterableIterator<Map<TKey, any>>): T[];
