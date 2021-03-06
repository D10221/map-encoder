import * as fs from 'fs';

export interface iDisctionary<T extends string | number | symbol> {
    [index: string]: T;
}

export function isMap(x: any): x is Map<any, any> {
    return x instanceof Map
}

export function toObject(map: Map<any, any>): Object {

    var o: any = Object.create(null);

    for (let [k, v] of map.entries()) {
        o[k] = isMap(v) ? toObject(v) : v;
    }
    return o;
}

export function isObject(x: any) {
    return typeof x == 'object';
}

/***
 * if recursive , returns Map<K,Map<K,V>> insteads of Map<K,V>
 * flattens Objects to maps 
 */
export function toMap<TKey>(obj: iDisctionary<any>, recursive = true ): Map<TKey, any> {    
    let map = new Map<TKey, any>();
    for (let k of Object.keys(obj)) {
        var value = obj[k];
        map.set(k as any, isObject(value)  && recursive ? toMap(value, recursive) : value);
    }
    return map;
}

export function serializeMapSync<K, V>(map: Map<K, V>): string {
    return JSON.stringify(toObject(map));
}

function serializeMapAsync<TKey, TValue>(map: Map<TKey, TValue>): Promise<string> {
    return new Promise((resolve, reject) => {
        try {
            resolve(serializeMapSync(map))
        } catch (e) {
            reject(e);
        }
    })
}


export function serializeToFileSync<K, V>(filePath: string, map: Map<K, V>): void {
    fs.writeFileSync(
        filePath,
        JSON.stringify(toObject(map))
    );
}

export function serializeToFile<K, V>(filePath: string, map: Map<K, V>): Promise<any> {
    return new Promise((resolve, reject) => {
        fs.writeFile(
            filePath,
            JSON.stringify(toObject(map)),
            e => {
                if (e) { reject(e); return; }
                resolve(true);
            }
        );
    })

}
let isEmpty = (x: string) :boolean => {         
    return !x || x.replace(/\s+/, '') == '';
};

export function deserialize<K, V>(text: string): Map<K, V> {
    if (isEmpty(text)) {
        console.warn('WARNING: empty json');
        return null
    };
    return toMap<K>(JSON.parse(text));
}

/***
 * if recursive , returns nested Maps <Map<K,Map<K,V>>...>
 */
export function deserializeFromFileSync<K, V>(filePath: string, recursive = true ): Map<K, V> {

    let text = fs.readFileSync(filePath, 'utf-8');
    
    if (isEmpty(text)) {
        console.warn('WARNING: empty json');
        return null
    };

    return toMap<K>(JSON.parse(text), recursive);
}


/**
 * Recursive? 
 */
export function deserializeFromFile<K, V>(filePath: string, recursive = true ): Promise<Map<K, V>> {

    return new Promise((rs, rj) => {
        fs.readFile(filePath, 'utf-8', (err, data) => {
            if (err) {
                rj(err);
            }            
            rs(toMap<K>(JSON.parse(data), recursive));
        });
    })
}



export function toMaps<T, TKey>(key: (target: T) => TKey, targets: T[]): Map<TKey, Map<string, any>> {

    var map = new Map<TKey, Map<string, any>>();

    targets.forEach(target => {

        map.set(key(target), toMap<string>(target));
    });

    return map;
}

export function fromMap<T, TKey>(type: { new (): T; }, map: Map<TKey, any>) {

    var target = new type();

    // value: V, index: K, map: Map<K, V>
    map.forEach((v: any, k: TKey) => {
        (target as any)[k as any] = v
    });

    return target;

}


export function fromMaps<T, TKey>(type: { new (): T; }, maps: IterableIterator<Map<TKey, any>>): T[] {

    var result: T[] = [];

    for (var map of maps) {

        result.push(fromMap(type, map))
    }
    return result;
}