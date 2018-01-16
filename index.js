"use strict";

const express = require("express"),
    bodyParser = require("body-parser"),
    Controller = require("./lib"),
    sendCalendar = require("./lib/send-calendar"),
    DEFAULT_PORT = 5000,
    PORT = process.env.PORT || DEFAULT_PORT,
    app = express(),
    render = (link = '') => {
        let more = '';
        if(link) {
            more = `<p>Calendar URL: <a href="https://${process.env.HEROKU_APP_NAME}.herokuapp.com/${link}">https://${process.env.HEROKU_APP_NAME}.herokuapp.com/${link}</a></p>`;
        }
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Twitch Events iCal Generator</title>
</head>
<body>
    <main>
        <h1>Get iCal for</h1>
        <form method="post" action="">
            <p><input type="text" name="username" placeholder="Username"></p>
            <p>
                <button type="submit" name="submit" value="channel">Channel Events</button>
                <button type="submit" name="submit" value="following">Following Channels Events</button>
            </p>
        </form>
        ${more}
    </main>
    <footer>
        <p><a href="https://github.com/freaktechnik/twitch-events-ical">Source Code</a></p>
    </footer>
</body>
</html>`;
    };

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/channel/:channelId', (req, res) => {
    sendCalendar(Controller.getChannelCalendar(req.params.channelId), res);
});
app.get('/following/:userId', (req, res) => {
    sendCalendar(Controller.getFollowsCalendar(req.params.userId), res);
});
app.route('/')
    .get((req, res) => {
        res.send(render());
    })
    .post((req, res) => {
        const type = req.body.submit,
            { username } = req.body;
        Controller.getUserId(username).then((id) => {
            res.send(render(`${type}/${id}`));
        })
            .catch(console.error);
    });
app.listen(PORT);
