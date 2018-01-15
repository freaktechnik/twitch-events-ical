const { Component, Property } = require("immutable-ics");

module.exports = class Calendar {
    /**
     * @param {string} channelName - ID for the calendar
     */
    constructor(channelName) {
        this.root = new Component({
            name: 'VCALENDAR',
            properties: [
                new Property({
                    name: 'VERSION',
                    value: 2
                }),
                new Property({
                    name: 'PRODID',
                    value: `twitchcal/${channelName}`
                })
            ]
        });
    }

    /**
     * @param {twitch/ChannelEvent} event - Event to add
     */
    addEvent(event) {
        const event = new Component({
            name: 'VEVENT',
            properties: [
                new Property({
                    name: 'DTSTART',
                    value: event.startTime
                }),
                new Property({
                    name: 'DTEND',
                    value: event.endTime
                }),
                new Property({
                    name: 'SUMMARY',
                    value: event.title
                }),
                new Property({
                    name: 'DESCRIPTION',
                    value: event.description
                }),
                new Property({
                    name: 'ORGANIZER',
                    parameter: {
                        CN: event.channel.displayName
                    },
                    value: `noreply-${event.channel.name}@twitch.tv`
                }),
                new Property({
                    name: 'URL',
                    value: `https://twitch.tv/events/${event.id}`
                }),
                new Property({
                    name: 'UID',
                    value: event.id
                }),
                new Property({
                    name: 'TRANSP',
                    value: 'TRANSPARENT'
                }),
                new Property({
                    name: 'STATUS',
                    value: 'CONFIRMED'
                }),
                new Property({
                    name: 'CLASS',
                    value: 'PUBLIC'
                }),
                new Property({
                    name: 'LOCATION',
                    value: `https://twitch.tv/${event.channel.name}`
                }),
                new Property({
                    name: 'ATTACH',
                    parameter: {
                        FMTTYPE: 'image/jpeg'
                    },
                    value: event.buildCoverImageUrl(640, 360)
                })
            ]
        });
        this.root.pushProperty(event);
    }

    addEvents(events) {
        for(const event of events) {
            this.addEvent(event);
        }
    }

    getICAL() {
        return this.root.toString();
    }
}
