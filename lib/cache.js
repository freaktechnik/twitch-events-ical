"use strict";

const redis = require('redis'),
    bluebird = require('bluebird'),
    ONE_HOUR = 3600,
    NIL = 0;
let redisClient;
if(process.env.NODE_ENV !== 'test' && process.env.REDIS_URL) {
    redisClient = redis.createClient(process.env.REDIS_URL);
}

bluebird.promisifyAll(redis.RedisClient.prototype);

module.exports = {
    CACHE_CHANNEL: 'channel',
    CACHE_FOLLOWS: 'follows',
    CACHE_USERID: 'username',
    /**
     * @param {string} id - ID of resource to cache.
     * @param {string} type - Type of resource to cache.
     * @returns {string} Unique cache key for resource.
     */
    buildKey(id, type) {
        return type + id;
    },
    /**
     * @param {Response} res - Express response object.
     * @param {string} key - Cache key of object.
     * @returns {undefined}
     */
    async setCacheHeaders(res, key) {
        if(redisClient) {
            const ttl = await redisClient.pttlAsync(key);
            if(ttl >= NIL) {
                const date = new Date(Date.now() + ttl);
                res.setHeader('Expires', date.toUTCString());
            }
            res.setHeader('Cache-Control', 'public');
        }
        else {
            res.setHeader('Cache-Control', 'public, max-age=3600');
        }
    },
    /**
     * @param {string} key - Cache key for object to store.
     * @param {string} data - Object data.
     * @returns {undefined}
     */
    store(key, data) {
        if(!redisClient) {
            return;
        }
        redisClient.set(key, data, 'EX', ONE_HOUR);
    },
    /**
     * @param {string} key - Cache key of object to retrieve.
     * @returns {string?} Cached object.
     * @async
     */
    get(key) {
        if(!redisClient) {
            return undefined;
        }
        return redisClient.getAsync(key);
    }
};
