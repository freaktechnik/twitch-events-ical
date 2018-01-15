const Calendar = require("./calendar");

const LIMIT = 100,
    getAllPages = async (method, page = 1) => {
        const results = await method(page, LIMIT);
        if(results.length !== LIMIT) {
            return results;
        }
        return results.concat(await getAllPages(method, page + 1));
    };

module.exports = {
    async GetChannelCalendar(channelId) {
        const events = await twitch.unsupported.getEvents(channelId);
        let channelName;
        if(events.length) {
            channelName = events[0].channel.name;
        }
        else {
            const user = await twitch.helix.users.getUserById(channelId);
            channelName = user.name;
        }

        const cal = new Calendar(channelName);
        cal.addEvents(events);
        return cal.getICAL();
    },
    async GetFollowsCalendar(userId) {
        const follows = await getAllPages((page, limit) => twitch.users.getFollowedChannels(userId, page, limit));
        const events = await Promise.all(follows.map(({ channel }) => twitch.unsupported.getEvents(channel.id)));
        const user = await twitch.helix.users.getUserById(userId);

        const cal = new Calendar(`follows/${user.name}`);
        cal.addEvents(events);
        return cal.geTICAL();
    }
};
