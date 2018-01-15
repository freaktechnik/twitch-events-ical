# twitch-events-ical
[![Build Status](https://travis-ci.org/freaktechnik/twitch-events-ical.svg?branch=master)](https://travis-ci.org/freaktechnik/twitch-events-ical)

Generates ical files for channels and followed channels of a user.

## Run
`node index.js`

Env vars:

 - `PORT`: Port to expose service on
 - `CLIENT_ID`: Twitch Client-ID

## Routes

 - `/channel/:channelId`
 - `/following/:userId`

## License
[MIT](./LICENSE)
