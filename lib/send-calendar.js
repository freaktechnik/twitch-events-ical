"use strict";

const SERVER_ERROR = 500;

/**
 * @param {string} calendar - Raw ics calendar.
 * @param {Response} response - Express response object.
 * @returns {undefined}
 */
module.exports = async (calendar, response) => {
    try {
        const ical = await calendar;
        response.type('text/calendar');
        response.send(ical);
    }
    catch(error) {
        console.error(error);
        response.status(SERVER_ERROR);
        response.send(error);
    }
};
