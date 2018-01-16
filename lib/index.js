"use strict";

const Calendar = require("./calendar"),
    { default: Twitch } = require("twitch"),
    redis = require('redis'),
    bluebird = require('bluebird'),
    FIRST_PAGE = 1,
    LIMIT = 100,
    ONE_HOUR = 3600,
    getAllPages = async (method, page = FIRST_PAGE) => {
        const results = await method(page, LIMIT);
        if(results.length !== LIMIT) {
            return results;
        }
        return results.concat(await getAllPages(method, page + FIRST_PAGE));
    },
    client = Twitch.withCredentials(process.env.CLIENT_ID),
    redisClient = redis.createClient(process.env.REDIS_URL),
    cache = (id, data) => {
        redisClient.set(id, data, 'EX', ONE_HOUR);
    };

bluebird.promisifyAll(redis.RedisClient.prototype);

module.exports = {
    async getUserId(username) {
        const cacheId = `username${username}`,
            cached = await redisClient.getAsync(cacheId);
        if(cached) {
            return cached;
        }
        const user = await client.helix.users.getUserByName(username);
        cache(cacheId, user.id);
        return user.id;
    },
    async getChannelCalendar(channelId) {
        const cacheId = `channel${channelId}`,
            cached = await redisClient.getAsync(cacheId);
        if(cached) {
            return cached;
        }
        const events = await client.unsupported.getEvents(channelId),
            cal = new Calendar(channelId);
        cal.addEvents(events);
        const data = cal.getICAL();
        cache(cacheId, data);
        return data;
    },
    async getFollowsCalendar(userId) {
        const cacheId = `follows${userId}`,
            cached = await redisClient.getAsync(cacheId);
        if(cached) {
            return cached;
        }
        const follows = await getAllPages((page, limit) => client.users.getFollowedChannels(userId, page, limit)),
            events = await Promise.all(follows.map(({ channel }) => client.unsupported.getEvents(channel.id))),
            cal = new Calendar(`follows/${userId}`);
        cal.addEvents([].concat(...events));
        const data = cal.getICAL();
        cache(cacheId, data);
        return data;
    }
};
