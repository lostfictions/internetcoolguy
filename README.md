## internet coolguy

![the interesting thoughts poster has logged on](https://i.imgur.com/2OCc9Un.png)

this is a ~~twitter and~~ mastodon bot written in javascript
([typescript](https://www.typescriptlang.org/), actually) running on
[node.js](http://nodejs.org/).

you can run it on your computer or remix it into something new! you'll need node
and [yarn](https://yarnpkg.com) installed. then run:
```
git clone https://github.com/lostfictions/internetcoolguy
cd internetcoolguy
yarn install
yarn dev
```

in a server environment, this bot can be run with
[docker](https://docs.docker.com/) for an easier time. (i recommend
[dokku](http://dokku.viewdocs.io/dokku/) if you're looking for a nice way to
develop and host bots.)

the bot needs environment variables if you want the it to do stuff:

- `DATA_DIR`: directory where source data lives and persistent data is written to (required in production)
- `MASTODON_TOKEN`: a Mastodon user API token (required)
- `MASTODON_SERVER`: the instance to which API calls should be made (usually where the bot user lives.) (default: https://botsin.space/)
- `CRON_RULE`: the interval between each post, in crontab format. (default: every four hours)

you can place any or all of these in a `.env` file in the root of this repo
during development. (but don't push this file to git!)


###### [more bots?](https://github.com/lostfictions?tab=repositories&q=botally)
