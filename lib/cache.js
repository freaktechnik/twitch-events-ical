"use strict";

const redis = require('redis'),
    bluebird = require('bluebird'),
    ONE_HOUR = 3600;
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
        res.setHeader('Cache-Control', `public, max-age=${ONE_HOUR}`);
        const ttl = await redisClient.pttlAsync(key),
            date = new Date(Date.now() + ttl);
        res.setHeader('Expires', date.toUTCString());
    },
    /**
     * @param {string} key - Cache key for object to store.
     * @param {string} data - Object data.
     * @returns {undefined}
     */
    store(key, data) {
        redisClient.set(key, data, 'EX', ONE_HOUR);
    },
    /**
     * @param {string} key - Cache key of object to retrieve.
     * @returns {string} Cached object.
     * @async
     */
    get(key) {
        return redisClient.getAsync(key);
    }
};
