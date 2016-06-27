"use strict";
const fs = require('fs');
const path = require('path');
const chai_1 = require('chai');
const encoder = require("./encoder");
describe('mapEncoder', () => {
    describe('ToObject', () => {
        it('works', () => {
            var map = new Map();
            var innerMap = new Map();
            innerMap.set('innerKey', { prop: 'x' });
            map.set('topKey', innerMap);
            var obj = encoder.toObject(map);
            var json = JSON.stringify(obj);
            var expected = JSON.stringify({ topKey: { innerKey: { prop: 'x' } } });
            chai_1.assert.equal(json, expected);
        });
    });
    describe('isObject', () => {
        it('works', () => {
            chai_1.assert.isTrue(encoder.isObject({}), '{} isObject');
            chai_1.assert.isTrue(encoder.isObject(new Thing()), 'class is Object');
            chai_1.assert.isFalse(encoder.isObject(""), 'string is Object');
            chai_1.assert.isFalse(encoder.isObject(1), 'number is Object');
        });
    });
    describe('ToMap', () => {
        it('works', () => {
            var map = null;
            profile('ToMap', () => {
                map = encoder.toMap({ topKey: { innerKey: { prop: 'x' } } });
            });
            chai_1.assert.equal(map.get('topKey').get('innerKey').get('prop'), 'x');
        });
    });
    describe('ToMaps', () => {
        it('works', () => {
            var things = [new Thing()];
            var mapped = encoder.toMaps(thing => thing.id, things);
            chai_1.assert.equal(mapped.get(0).get('id'), 0);
        });
    });
    describe('FromMap', () => {
        it('works', () => {
            var map = new Map();
            map.set('id', 1);
            map.set('xname', 'x');
            var thing = encoder.fromMap(Thing, map);
            chai_1.assert.isDefined(thing, 'is there such a thing');
            chai_1.assert.equal(thing.id, 1, ' id equals ');
            chai_1.assert.equal(thing.xname, 'x', 'xname equals ');
        });
    });
    describe('fromMaps', () => {
        it('works', () => {
            var expected = [{ id: 0, xname: 'x' }, { id: 1, xname: 'y' }];
            var maps = encoder.toMaps(x => x.id, expected);
            var things = encoder.fromMaps(Thing, maps.values());
            chai_1.assert.deepEqual(things, expected);
        });
    });
    describe('From Maps To Maps', () => {
        it('Works with 100000 recordst', () => {
            var things = generate(0, 100000, x => new Thing(x, x.toString()));
            var maps = null;
            profile('toMaps: 100,000', () => {
                maps = encoder.toMaps(x => x.id, things);
            });
            var out = null;
            profile('fromMaps: 100,000', () => {
                out = encoder.fromMaps(Thing, maps.values());
            });
            chai_1.assert.equal(JSON.stringify(out), JSON.stringify(things));
        });
    });
    describe('serializetoFile/deserializeFromFile', () => {
        it('works', () => {
            let map = new Map();
            map.set('1', 1);
            let storePath = path.join(process.cwd(), 'x.db');
            encoder.serializeToFileSync(storePath, map);
            let other = encoder.deserializeFromFileSync(storePath);
            chai_1.assert.deepEqual(map, other);
        });
    });
    describe('problems', () => {
        it('returns nothing when file text is empty (async)', () => {
            let map = encoder.deserialize('');
            chai_1.assert.isNull(map);
        });
        it('returns null if encoded text is empty (sync)', () => {
            let dbPath = path.join(process.cwd(), 'empty.db');
            fs.writeFileSync(dbPath, '');
            let map = encoder.deserializeFromFileSync(dbPath);
            chai_1.assert.isNull(map);
        });
    });
});
class Thing {
    constructor(id, xname) {
        this.id = id;
        this.xname = xname;
        this.id = isUndefined(this.id) ? 0 : this.id;
        this.xname = this.xname || '';
    }
}
function isUndefined(x) {
    return 'undefined' == typeof (x);
}
function profile(label, action) {
    console.time(label);
    action();
    console.timeEnd(label);
}
function generate(from, to, func) {
    let results = [];
    for (let i = from; i <= to; i++) {
        results.push(func(i));
    }
    return results;
}
//# sourceMappingURL=encoder_test.js.map