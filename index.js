"use strict";

const express = require("express"),
    Controller = require("./lib"),
    sendCalendar = require("./lib/send-calendar"),
    DEFAULT_PORT = 5000,
    PORT = process.env.PORT || DEFAULT_PORT;

express()
    .get('/channel/:channelId', (req, res) => {
        sendCalendar(Controller.getChannelCalendar(req.params.channelId), res);
    })
    .get('/following/:userId', (req, res) => {
        sendCalendar(Controller.getFollowsCalendar(req.params.userId), res);
    })
    .listen(PORT);
