"use strict";

const redis = require('redis'),
    bluebird = require('bluebird'),
    ONE_HOUR = 3600,
    NIL = 0,
    ONE = 1;
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
     * @param {Response} response - Express response object.
     * @param {string} key - Cache key of object.
     * @returns {undefined}
     */
    async setCacheHeaders(response, key) {
        if(redisClient) {
            const ttl = await redisClient.pttlAsync(key);
            if(ttl >= NIL) {
                const date = new Date(Date.now() + ttl);
                response.setHeader('Expires', date.toUTCString());
            }
        }
        response.setHeader('Cache-Control', 'public, max-age=3600');
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
        //TODO can cache usernames for 24 hours
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
    },
    /**
     * @param {string} list - List to queue key in.
     * @param {string} key - Key to queue in list.
     * @returns {undefined}
     */
    queue(list, key) {
        if(!redisClient) {
            return;
        }
        redisClient.rpush(list, key);
    },
    /**
     * @param {string} list - Queue to get.
     * @returns {string[]}
     */
    async getQueue(list) {
        const length = await redisClient.llenAsync(list),
            queue = await redisClient.lrangeAsync(list, NIL, length - ONE);
        redisClient.del(list);
        return queue;
    }
};
