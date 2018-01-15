const express = require("express");
const PORT = process.env.PORT || 5000;
const Controller = require("./lib");
const sendCalendar = require("./lib/send-calendar");

express()
    .get('/channel/:channelId', (req, res) => {
        sendCalendar(Controller.GetChannelCalendar(req.params.channelId), res);
    })
    .get('/following/:userId', (req, res) => {
        sendCalendar(Controller.GetFollowsCalendar(req.params.userId), res);
    })
    .listen(PORT);
