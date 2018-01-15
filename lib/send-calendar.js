module.exports = async (calendar, res) => {
    try {
        const ical = calendar;
        res.type('text/calendar');
        res.send(ical);
    }
    catch(e) {
        res.sendStatus(500);
        res.send(e);
    }
};
