"use strict";

const express = require("express"),
    bodyParser = require("body-parser"),
    Controller = require("./lib"),
    sendCalendar = require("./lib/send-calendar"),
    SEE_ALSO = 303,
    DEFAULT_PORT = 5000,
    PORT = process.env.PORT || DEFAULT_PORT,
    app = express();

app.use(bodyParser.urlencoded({ extended: true }));

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
            <p><input type="text" name="username" placeholder="Username"></p>
            <p>
                <button type="submit" name="submit" value="channel">Channel Events</button>
                <button type="submit" name="submit" value="following">Following Channels Events</button>
            </p>
        </form>
    </main>
    <footer>
        <p><a href="https://github.com/freaktechnik/twitch-events-ical">Source Code</a></p>
    </footer>
</body>
</html>`);
    })
    .post((req, res) => {
        const type = req.body.submit,
            username = req.body.username;
        Controller.getUserId(username).then((id) => {
            res.status(SEE_ALSO);
            res.append('Location', `/${type}/${id}`);
            res.end();
        })
            .catch(console.error);
    });
app.listen(PORT);
