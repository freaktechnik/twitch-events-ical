"use strict";

const SERVER_ERROR = 500;

/**
 * @param {string} calendar - Raw ics calendar.
 * @param {Response} res - Express response object.
 * @returns {undefined}
 */
module.exports = async (calendar, res) => {
    try {
        const ical = await calendar;
        res.type('text/calendar');
        res.send(ical);
    }
    catch(e) {
        console.error(e);
        res.status(SERVER_ERROR);
        res.send(e);
    }
};
