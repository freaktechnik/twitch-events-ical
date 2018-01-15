"use strict";

const Calendar = require("./calendar"),
    Twitch = require("twitch"),
    FIRST_PAGE = 1,
    LIMIT = 100,
    getAllPages = async (method, page = FIRST_PAGE) => {
        const results = await method(page, LIMIT);
        if(results.length !== LIMIT) {
            return results;
        }
        return results.concat(await getAllPages(method, page + FIRST_PAGE));
    },
    client = Twitch.withCredentials(process.env.CLIENT_ID);

module.exports = {
    async getChannelCalendar(channelId) {
        const events = await client.unsupported.getEvents(channelId);
        let channelName;
        if(events.length) {
            const [ event ] = events;
            channelName = event.channel.name;
        }
        else {
            const user = await client.helix.users.getUserById(channelId);
            channelName = user.name;
        }

        const cal = new Calendar(channelName);
        cal.addEvents(events);
        return cal.getICAL();
    },
    async getFollowsCalendar(userId) {
        const follows = await getAllPages((page, limit) => client.users.getFollowedChannels(userId, page, limit)),
            events = await Promise.all(follows.map(({ channel }) => client.unsupported.getEvents(channel.id))),
            user = await client.helix.users.getUserById(userId),
            cal = new Calendar(`follows/${user.name}`);
        cal.addEvents(events);
        return cal.getICAL();
    }
};
