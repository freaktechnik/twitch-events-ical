import test from 'ava';
import * as cache from '../lib/cache';

test('getCacheKeys are unique', (t) => {
    const TYPES = [
        cache.CACHE_USERID,
        cache.CACHE_CHANNEL,
        cache.CACHE_FOLLOWS
    ];

    const keys = [];
    for(const type of TYPES) {
        keys.push(cache.buildKey('foo', type));
    }

    for(let i = 0; i < keys.length; ++i) {
        t.not(keys[i], keys[(i + 1) % keys.length]);
    }
});
