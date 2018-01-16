# twitch-events-ical

[![Greenkeeper badge](https://badges.greenkeeper.io/freaktechnik/twitch-events-ical.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/freaktechnik/twitch-events-ical.svg?branch=master)](https://travis-ci.org/freaktechnik/twitch-events-ical)

Generates ical files for channels and followed channels of a user.

## Run
`node index.js`

Env vars:

 - `PORT`: Port to expose service on
 - `CLIENT_ID`: Twitch Client-ID
 - `REDIS_URL`: URL to redis (used for caching)
 - `HEROKU_APP_NAME`: name of the heroku app 

## Routes

 - [`/channel/:channelId`](https://twitch-events-ical.herokuapp.com/channel/channelId)
 - [`/following/:userId`](https://twitch-events-ical.herokuapp.com/following/userId)

## License
[MIT](./LICENSE)
