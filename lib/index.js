"use strict";

const Calendar = require("./calendar"),
    { default: Twitch } = require("twitch"),
    redis = require('redis'),
    util = require('util'),
    FIRST_PAGE = 1,
    LIMIT = 100,
    ONE_HOUR = 3600000,
    getAllPages = async (method, page = FIRST_PAGE) => {
        const results = await method(page, LIMIT);
        if(results.length !== LIMIT) {
            return results;
        }
        return results.concat(await getAllPages(method, page + FIRST_PAGE));
    },
    client = Twitch.withCredentials(process.env.CLIENT_ID),
    redisClient = redis.createClient(process.env.REDIS_URL),
    redisGet = util.promisify(redisClient.get.bind(redisClient));

module.exports = {
    _cache(id, data) {
        redisClient.set(id, {
            ts: Date.now(),
            data
        });
    },
    async getUserId(username) {
        const user = await client.helix.users.getUserByName(username);
        return user.id;
    },
    async getChannelCalendar(channelId) {
        const cacheId = `channel/${channelId}`,
            cached = redisGet(cacheId);
        if(cached && cached.ts > Date.now() - ONE_HOUR) {
            return cached.data;
        }
        const events = await client.unsupported.getEvents(channelId),
            cal = new Calendar(channelId);
        cal.addEvents(events);
        const data = cal.getICAL();
        this._cache(cacheId, data);
        return data;
    },
    async getFollowsCalendar(userId) {
        const cacheId = `follows/${userId}`,
            cached = redisGet(cacheId);
        if(cached && cached.ts > Date.now() - ONE_HOUR) {
            return cached.data;
        }
        const follows = await getAllPages((page, limit) => client.users.getFollowedChannels(userId, page, limit)),
            events = await Promise.all(follows.map(({ channel }) => client.unsupported.getEvents(channel.id))),
            cal = new Calendar(cacheId);
        cal.addEvents(events);
        const data = cal.getICAL();
        this._cache(cahceId, data);
        return data;
    }
};
