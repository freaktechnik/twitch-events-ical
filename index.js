"use strict";

const express = require("express"),
    bodyParser = require("body-parser"),
    Controller = require("./lib"),
    sendCalendar = require("./lib/send-calendar"),
    cache = require("./lib/cache"),
    DEFAULT_PORT = 5000,
    PORT = process.env.PORT || DEFAULT_PORT,
    CSP = "default-src 'none'; form-action 'self'; frame-ancestors 'none'",
    app = express(),
    setHeaders = (res) => {
        res.setHeader('Content-Security-Policy', CSP);
        res.setHeader('X-Frame-Options', 'SAMEORIGIN');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    },
    makeUrl = (link, protocol = 'https') => `${protocol}://${process.env.HEROKU_APP_NAME}.herokuapp.com${link}`,
    render = (link = '') => {
        let more = '';
        if(link) {
            more = `<p>Calendar URL: <a href="${makeUrl(link)}" rel="noopener">${makeUrl(link)}</a> (<a href="${makeUrl(link, 'webcal')}">subscribe</a>)</p>`;
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
            <p><input type="text" name="username" placeholder="Username" required></p>
            <p>
                <button type="submit" name="submit" value="channel">Channel Events</button>
                <button type="submit" name="submit" value="following">Following Channels Events</button>
            </p>
        </form>
        ${more}
    </main>
    <footer>
        <p><a href="https://github.com/freaktechnik/twitch-events-ical" rel="external noopener">Source Code</a></p>
    </footer>
</body>
</html>`;
    };

app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    next();
});

app.get('/channel/:channelId', async (req, res) => {
    await cache.setCacheHeaders(res, cache.buildKey(req.params.channelId, cache.CACHE_CHANNEL));
    sendCalendar(Controller.getChannelCalendar(req.params.channelId, makeUrl(req.originalUrl)), res);
});
app.get('/following/:userId', async (req, res) => {
    await cache.setCacheHeaders(res, cache.buildKey(req.params.userId, cache.CACHE_FOLLOWS));
    sendCalendar(Controller.getFollowsCalendar(req.params.userId, makeUrl(req.originalUrl)), res);
});
app.route('/')
    .get((req, res) => {
        res.setHeader('Cache-Control', 'public, max-age=3600');
        setHeaders(res);
        res.send(render());
    })
    .post(async (req, res) => {
        res.setHeader('Cache-Control', `private, no-cache, no-store, must-revalidate`);
        setHeaders(res);
        const type = req.body.submit,
            { username } = req.body,
            id = await Controller.getUserId(username);
        res.send(render(`/${type}/${id}`));
    });
app.listen(PORT);
