"use strict";

const Calendar = require("./calendar"),
    { default: Twitch } = require("twitch"),
    cache = require("./cache"),
    client = Twitch.withClientCredentials(process.env.CLIENT_ID, process.env.CLIENT_SECRET);

module.exports = {
    /**
     * @param {string} username - User to get the ID of.
     * @returns {string} ID of the user.
     */
    async getUserId(username) {
        const cacheId = cache.buildKey(username, cache.CACHE_USERID),
            cached = await cache.get(cacheId);
        if(cached) {
            return cached;
        }
        const user = await client.helix.users.getUserByName(username);
        cache.store(cacheId, user.id);
        return user.id;
    },
    /**
     * @param {string} channelId - Channel to get the calendar for.
     * @param {string} sourceUrl - URL that this calendar will be served at.
     * @returns {string} Raw ics calendar for the channel.
     */
    async getChannelCalendar(channelId, sourceUrl) {
        const cacheId = cache.buildKey(channelId, cache.CACHE_CHANNEL),
            cached = await cache.get(cacheId);
        cache.queue(cache.CACHE_CHANNEL, cacheId);
        if(cached) {
            return cached;
        }
        //TODO set URL property to events page of channel
        const cal = new Calendar(`channel/${channelId}`, sourceUrl),
            data = cal.getICAL();
        cache.store(cacheId, data);
        return data;
    },
    /**
     * @param {string} userId - User to get the calendar of events from followed
     *                          channels for.
     * @param {string} sourceUrl - URL that this calendar will be served at.
     * @returns {string} Raw ics calendar of events from followed channels.
     */
    async getFollowsCalendar(userId, sourceUrl) {
        const cacheId = cache.buildKey(userId, cache.CACHE_FOLLOWS),
            cached = await cache.get(cacheId);
        cache.queue(cache.CACHE_FOLLOWS, cacheId);
        if(cached) {
            return cached;
        }
        const cal = new Calendar(`follows/${userId}`, sourceUrl),
            data = cal.getICAL();
        cache.store(cacheId, data);
        return data;
    }
};
