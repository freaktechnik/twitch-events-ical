# twitch-events-ical


[![Build Status](https://travis-ci.com/freaktechnik/twitch-events-ical.svg?branch=master)](https://travis-ci.com/freaktechnik/twitch-events-ical)

> Broken due to Twitch removing the events API. There is no replacement on the horizon for the schedule feature. If that ever happens, I may build something similar again.

Generates ical files for channels and followed channels of a user.

## Run

`node index.js`

Or [![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

After deploying, you need to configure the scheduler add-on to run the "cron" job once every hour.

### Env vars

- `PORT`: Port to expose service on
- `CLIENT_ID`: Twitch Client-ID
- `REDIS_URL`: URL to redis (used for caching)
- `HEROKU_APP_NAME`: Name of the heroku app

## Routes

- [`/`](https://twitch-events-ical.herokuapp.com)
- [`/channel/:channelId`](https://twitch-events-ical.herokuapp.com/channel/channelId)
- [`/following/:userId`](https://twitch-events-ical.herokuapp.com/following/userId)

## License

[MIT](./LICENSE)
