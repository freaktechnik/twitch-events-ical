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
app.use((request, response, next) => {
    response.setHeader('X-Content-Type-Options', 'nosniff');
    next();
});

app.get('/channel/:channelId', async (request, response) => {
    await cache.setCacheHeaders(response, cache.buildKey(request.params.channelId, cache.CACHE_CHANNEL));
    sendCalendar(Controller.getChannelCalendar(request.params.channelId, makeUrl(request.originalUrl)), response);
});
app.get('/following/:userId', async (request, response) => {
    await cache.setCacheHeaders(response, cache.buildKey(request.params.userId, cache.CACHE_FOLLOWS));
    sendCalendar(Controller.getFollowsCalendar(request.params.userId, makeUrl(request.originalUrl)), response);
});
app.route('/')
    .get((request, response) => {
        response.setHeader('Cache-Control', 'public, max-age=3600');
        setHeaders(response);
        response.send(render());
    })
    .post(async (request, response) => {
        response.setHeader('Cache-Control', `private, no-cache, no-store, must-revalidate`);
        setHeaders(response);
        const type = request.body.submit,
            { username } = request.body,
            id = await Controller.getUserId(username);
        response.send(render(`/${type}/${id}`));
    });
app.listen(PORT);
