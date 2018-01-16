"use strict";

const express = require("express"),
    Controller = require("./lib"),
    sendCalendar = require("./lib/send-calendar"),
    DEFAULT_PORT = 5000,
    PORT = process.env.PORT || DEFAULT_PORT,
    app = express();

app.get('/channel/:channelId', (req, res) => {
    sendCalendar(Controller.getChannelCalendar(req.params.channelId), res);
});
app.get('/following/:userId', (req, res) => {
    sendCalendar(Controller.getFollowsCalendar(req.params.userId), res);
});
app.route('/')
    .get((req, res) => {
        res.send(`<!DOCTPYE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Twitch Events iCal Generator</title>
</head>
<body>
    <main>
        <h1>Get iCal for</h1>
        <form method="post" action="">
            <input type="text" name="username" placeholder="Username">
            <button type="submit" name="submit" value="channel">Channel Events</button>
            <button type="submit" name="submit" value="following">Following Channels Events</button>
        </form>
    </main>
    <footer>
        <p><a href="https://github.com/freaktechnik/twitch-events-ical">Source Code</a></p>
    </footer>
</body>
</html>`);
    })
    .post((req, res) => {
        const type = req.param('submit'),
            username = req.param('username');
        Controller.getUserId(username).then((id) => {
            res.append('Location', `/${type}/${id}`);
            res.end();
        })
            .catch(console.error);
    });
app.listen(PORT);
