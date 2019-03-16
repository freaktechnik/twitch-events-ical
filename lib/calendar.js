"use strict";

const {
        Component,
        Property
    } = require("immutable-ics"),
    IMAGE_WIDTH = 640,
    IMAGE_HEIGHT = 360,
    PAD_WIDTH = 2,
    MONTH_OFFSET = 1;

module.exports = class Calendar {
    /**
     * @param {string} channelName - ID for the calendar.
     * @param {string} sourceUrl - URL where the calendar is served from.
     * @param {Object} extras - Extra properties for the calendar.
     */
    constructor(channelName, sourceUrl, extras) {
        this.root = new Component({
            name: 'VCALENDAR',
            properties: [
                new Property({
                    name: 'VERSION',
                    value: 2
                }),
                new Property({
                    name: 'PRODID',
                    value: `twitchcal-${channelName}`
                }),
                new Property({
                    name: 'X-PUBLISHED-TTL',
                    value: 'P1H'
                }),
                new Property({
                    name: 'REFRESH-INTERVAL',
                    value: 'P1H',
                    parameters: {
                        VALUE: 'DURATION'
                    }
                }),
                new Property({
                    name: 'SOURCE',
                    value: sourceUrl,
                    parameters: {
                        VALUE: 'URI'
                    }
                })
                // new Property({
                //     name: 'IMAGE',
                //     value: channelAvatar,
                //     parameters: {
                //         VALUE: 'URI',
                //         DISPLAY: 'BADGE' //THUMBNAIL for the channel banner?
                //     }
                // })
            ]
        });
        if(extras) {
            if(extras.name) {
                this.root = this.root.pushProperty(new Property({
                    name: 'X-WR-CALNAME',
                    value: extras.name
                }));
                this.root = this.root.pushProperty(new Property({
                    name: 'NAME',
                    value: extras.name
                }));
            }
            if(extras.url) {
                this.root = this.root.pushProperty(new Property({
                    name: 'URL',
                    value: extras.url,
                    parameters: {
                        VALUE: 'URI'
                    }
                }));
            }
            if(extras.badge) {
                this.root = this.root.pushProperty(new Property({
                    name: 'IMAGE',
                    value: extras.badge,
                    parameters: {
                        VALUE: 'URI',
                        DISPLAY: 'BADGE'
                    }
                }));
            }
            if(extras.header) {
                this.root = this.root.pushProperty(new Property({
                    name: 'IMAGE',
                    value: extras.header,
                    parameters: {
                        VALUE: 'URI',
                        DISPLAY: 'FULLSIZE'
                    }
                }));
            }
        }
    }

    padNumber(number) {
        return number.toString().padStart(PAD_WIDTH, '0');
    }

    formatEventDate(date) {
        return `${date.getUTCFullYear()}-${this.padNumber(date.getUTCMonth() + MONTH_OFFSET)}-${this.padNumber(date.getUTCDate())}T${this.padNumber(date.getUTCHours())}:${this.padNumber(date.getUTCMinutes())}-${this.padNumber(date.getUTCSeconds())}Z`;
    }

    /**
     * @param {twitch/ChannelEvent} event - Event to add.
     * @returns {undefined}
     */
    addEvent(event) {
        const vevent = new Component({
            name: 'VEVENT',
            properties: [
                new Property({
                    name: 'DTSTART',
                    value: this.formatEventDate(event.startDate)
                }),
                new Property({
                    name: 'DTEND',
                    value: this.formatEventDate(event.endDate)
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
                    parameters: {
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
                    value: `https://twitch.tv/${event.channel.name}`,
                    parameters: {
                        VALUE: 'URI'
                    }
                }),
                new Property({
                    name: 'ATTACH',
                    parameters: {
                        FMTTYPE: 'image/jpeg'
                    },
                    value: event.buildCoverImageUrl(IMAGE_WIDTH, IMAGE_HEIGHT)
                }),
                new Property({
                    name: 'IMAGE',
                    parameters: {
                        FMTTYPE: 'image/jpeg',
                        DISPLAY: 'FULLSIZE',
                        VALUE: 'URI'
                    },
                    value: event.buildCoverImageUrl(IMAGE_WIDTH, IMAGE_HEIGHT)
                }),
                new Property({
                    name: 'IMAGE',
                    parameters: {
                        DISPLAY: 'BADGE',
                        VALUE: 'URI'
                    },
                    value: event.channel.logo
                }),
                new Property({
                    name: 'CATEGORIES',
                    value: event.channel.displayName
                })
            ]
        });
        this.root = this.root.pushComponent(vevent);
    }

    /**
     * @param {[twitch/ChannelEvent]} events - Events to add to this calendar.
     * @returns {undefined}
     */
    addEvents(events) {
        for(const event of events) {
            this.addEvent(event);
        }
    }

    /**
     * @returns {string} Raw ics string.
     */
    getICAL() {
        return this.root.toString();
    }
};
