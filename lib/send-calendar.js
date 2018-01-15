"use strict";

const SERVER_ERROR = 500;

module.exports = async (calendar, res) => {
    try {
        const ical = await calendar;
        res.type('text/calendar');
        res.send(ical);
    }
    catch(e) {
        res.status(SERVER_ERROR);
        res.send(e);
    }
};
