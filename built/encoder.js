"use strict";
const fs = require('fs');
function isMap(x) {
    return x instanceof Map;
}
exports.isMap = isMap;
function toObject(map) {
    var o = Object.create(null);
    for (let [k, v] of map.entries()) {
        o[k] = isMap(v) ? toObject(v) : v;
    }
    return o;
}
exports.toObject = toObject;
function isObject(x) {
    return typeof x == 'object';
}
exports.isObject = isObject;
/***
 * if recursive , returns Map<K,Map<K,V>> insteads of Map<K,V>
 * flattens Objects to maps
 */
function toMap(obj, recursive = true) {
    let map = new Map();
    for (let k of Object.keys(obj)) {
        var value = obj[k];
        map.set(k, isObject(value) && recursive ? toMap(value, recursive) : value);
    }
    return map;
}
exports.toMap = toMap;
function serializeMapSync(map) {
    return JSON.stringify(toObject(map));
}
exports.serializeMapSync = serializeMapSync;
function serializeMapAsync(map) {
    return new Promise((resolve, reject) => {
        try {
            resolve(serializeMapSync(map));
        }
        catch (e) {
            reject(e);
        }
    });
}
function serializeToFileSync(filePath, map) {
    fs.writeFileSync(filePath, JSON.stringify(toObject(map)));
}
exports.serializeToFileSync = serializeToFileSync;
function serializeToFile(filePath, map) {
    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, JSON.stringify(toObject(map)), e => {
            if (e) {
                reject(e);
                return;
            }
            resolve(true);
        });
    });
}
exports.serializeToFile = serializeToFile;
let isEmpty = (x) => {
    return !x || x.replace(/\s+/, '') == '';
};
function deserialize(text) {
    if (isEmpty(text)) {
        console.warn('WARNING: empty json');
        return null;
    }
    ;
    return toMap(JSON.parse(text));
}
exports.deserialize = deserialize;
/***
 * if recursive , returns nested Maps <Map<K,Map<K,V>>...>
 */
function deserializeFromFileSync(filePath, recursive = true) {
    let text = fs.readFileSync(filePath, 'utf-8');
    if (isEmpty(text)) {
        console.warn('WARNING: empty json');
        return null;
    }
    ;
    return toMap(JSON.parse(text), recursive);
}
exports.deserializeFromFileSync = deserializeFromFileSync;
/**
 * Recursive?
 */
function deserializeFromFile(filePath, recursive = true) {
    return new Promise((rs, rj) => {
        fs.readFile(filePath, 'utf-8', (err, data) => {
            if (err) {
                rj(err);
            }
            rs(toMap(JSON.parse(data), recursive));
        });
    });
}
exports.deserializeFromFile = deserializeFromFile;
function toMaps(key, targets) {
    var map = new Map();
    targets.forEach(target => {
        map.set(key(target), toMap(target));
    });
    return map;
}
exports.toMaps = toMaps;
function fromMap(type, map) {
    var target = new type();
    // value: V, index: K, map: Map<K, V>
    map.forEach((v, k) => {
        target[k] = v;
    });
    return target;
}
exports.fromMap = fromMap;
function fromMaps(type, maps) {
    var result = [];
    for (var map of maps) {
        result.push(fromMap(type, map));
    }
    return result;
}
exports.fromMaps = fromMaps;
//# sourceMappingURL=encoder.js.map