"use strict";

const Calendar = require("./lib/calendar"),
    { default: Twitch } = require("twitch"),
    cache = require("./lib/cache"),
    client = Twitch.withClientCredentials(process.env.CLIENT_ID, process.env.CLIENT_SECRET);

Promise.all([
    cache.getQueue(cache.CACHE_CHANNEL),
    cache.getQueue(cache.CACHE_FOLLOWS)
])
    .then(async ([
        channels,
        follows
    ]) => {
        const following = {};
        for(const userId of follows) {
            const followsRequest = client.helix.users.getFollowsPaginated({
                user: userId
            });
            following[userId] = [];
            for await (const follow of followsRequest) {
                following[userId].push(follow.map((f) => f.followedUserId));
            }
        }

        const channelsToGetEventsFrom = channels.concat(Object.values(following)),
            events = {};
        for(const channelId of channelsToGetEventsFrom) {
            events[channelId] = await client.unsupported.getEvents(channelId);
        }

        for(const channelId of channels) {
            const cacheId = cache.buildKey(channelId, cache.CACHE_CHANNEL),
                cal = new Calendar(`channel/${channelId}`, `https://${process.env.HEROKU_APP_NAME}.herokuapp.com/channel/${channelId}`);
            cal.addEvents(events[channelId]);
            const data = cal.getICAL();
            cache.store(cacheId, data);
        }

        for(const [
            userId,
            followedChannels
        ] of Object.entries(following)) {
            const cacheId = cache.buildKey(userId, cache.CACHE_FOLLOWS),
                cal = new Calendar(`follows/${userId}`, `https://${process.env.HEROKU_APP_NAME}.herokuapp.com/follows/${channelId}`);
            for(const channelId of followedChannels) {
                cal.addEvents(events[channelId]);
            }
            const data = cal.getICAL();
            cache.store(cacheId, data);
        }
    })
    .catch(console.error);
