import * as fs from 'fs';
import * as path from 'path';
import {assert} from 'chai';
import * as encoder from "./encoder";
import * as chain from 'chain';


describe('mapEncoder', () => {

    describe('ToObject', () => {

        it('works', () => {

            var map = new Map<string, Map<string, any>>();

            var innerMap = new Map<string, any>();

            innerMap.set('innerKey', { prop: 'x' });

            map.set('topKey', innerMap);

            var obj = encoder.toObject(map);

            var json = JSON.stringify(obj);

            var expected = JSON.stringify({ topKey: { innerKey: { prop: 'x' } } });

            assert.equal(json, expected);

        })

    });

    describe('isObject', () => {
        it('works', () => {

            assert.isTrue(encoder.isObject({}), '{} isObject');
            assert.isTrue(encoder.isObject(new Thing()), 'class is Object');
            assert.isFalse(encoder.isObject(""), 'string is Object');
            assert.isFalse(encoder.isObject(1), 'number is Object');

        });
    });

    describe('ToMap', () => {

        it('works', () => {

            var map: Map<string, Map<string, Map<string, any>>> = null;

            profile('ToMap', () => {
                map = encoder.toMap({ topKey: { innerKey: { prop: 'x' } } }) as Map<string, Map<string, Map<string, any>>>;
            });

            assert.equal(map.get('topKey').get('innerKey').get('prop'), 'x');

        });
    });

    describe('ToMaps', () => {

        it('works', () => {

            var things = [new Thing()];

            var mapped = encoder.toMaps(thing => thing.id, things)

            assert.equal(mapped.get(0).get('id'), 0);
        });
    });

    describe('FromMap', () => {
        it('works', () => {
            var map = new Map<string, any>();
            map.set('id', 1);
            map.set('xname', 'x');
            var thing = encoder.fromMap(Thing, map);
            assert.isDefined(thing, 'is there such a thing');
            assert.equal(thing.id, 1, ' id equals ');
            assert.equal(thing.xname, 'x', 'xname equals ');
        });
    });


    describe('fromMaps', () => {

        it('works', () => {

            var expected = [new Thing(0,'x'), new Thing(1, 'y')];

            var maps: Map<number, Map<string, any>> = encoder.toMaps(x => x.id, expected as Thing[]);

            var things = encoder.fromMaps(Thing, maps.values());

            assert.equal(JSON.stringify(things), JSON.stringify(expected));

        });

    });

    describe('From Maps To Maps', () => {

        it('Works with 100000 recordst', () => {

            var things = generate(0, 100000, x => new Thing(x, x.toString()));

            var maps: Map<any, Map<string, any>> = null;
            profile('toMaps: 100,000', () => {
                maps = encoder.toMaps<any, Thing>(x => x.id, things);
            });

            var out: Thing[] = null;
            profile('fromMaps: 100,000', () => {
                out = encoder.fromMaps(Thing, maps.values());
            });

            assert.equal(JSON.stringify(out), JSON.stringify(things))

        })
    });

    describe('serializetoFile/deserializeFromFile', () => {

        it('works', () => {
            let map = new Map<string, any>();
            map.set('1', 1);
            let storePath = path.join(process.cwd(), 'x.db');
            encoder.serializeToFileSync(storePath, map);
            let other = encoder.deserializeFromFileSync(storePath);
            assert.deepEqual(map, other);
        })

        it('works with Map<X,Object>', () => {
            let map = new Map<string, Thing>();
            map.set('1', new Thing(1, '1'));
            let storePath = path.join(process.cwd(), 'x.db');
            encoder.serializeToFileSync(storePath, map);
            let other = encoder.deserializeFromFileSync(storePath);
            let found: Thing = null;
            for (let thing of map.values()) {
                if (thing.xname == '1') {
                    found = thing;
                    break;;
                }
            }
            let type = typeof found;
            assert.isTrue('object' == type)
            assert.isNotNull(found);
            //WRONG they are both MAPs not Objects 
            assert.deepEqual(map, other);
        })
    })

    it('Deserialize Non recursive', () => {
        let map = new Map<string, iThing>();
        map.set('1', new Thing(1, '1'));
        let storePath = path.join(process.cwd(), 'x.db');
        encoder.serializeToFileSync(storePath, map);
        let other = encoder.deserializeFromFileSync(storePath, false);
        let value = other.get('1');
        assert.isObject(value);
        //saved as Objects 
        //should return Map<S,Thing>
    });

    describe('problems', () => {

        it('returns nothing when text is empty', () => {
            let map = encoder.deserialize('');
            assert.isNull(map);
        })

        it('returns null if encoded file text is empty (sync)', () => {
            let dbPath = path.join(process.cwd(), 'empty.db');
            fs.writeFileSync(dbPath, '');
            let map = encoder.deserializeFromFileSync(dbPath);
            assert.isNull(map);
        })
    })

});
class Thing {
    constructor(public id?: number, public xname?: string) {
        this.id = isUndefined(this.id) ? 0 : this.id;
        this.xname = this.xname || '';
    }
   // attributes = [ 'x', 'y', 'z']
}

interface iThing {
    xname: string;
    id:number ;
    //attributes:any[];
}

function isUndefined(x): boolean {
    return 'undefined' == typeof (x);
}

function profile(label: string, action: (x?: any) => any) {
    console.time(label);
    action();
    console.timeEnd(label);
}

function generate<T>(from: number, to: number, func: (x: number) => T): T[] {
    let results = [];
    for (let i = from; i <= to; i++) {
        results.push(func(i))
    }
    return results;
}