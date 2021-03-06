# Fortnite-Stats

### You can invite this bot to your discord server using the [via this link.](https://discordapp.com/api/oauth2/authorize?client_id=493039575988568064&permissions=8&scope=bot)

Fortnite Stats bot for Discord. DB functionality, Epic auth and Stats Endpoints.

If you are simply looking to fetch stats out of the box, the `!stats` and `!season` commands will work. To set permissions of the bot and to configure who and where it can be used, you can run `!config`.

If you find issues or bugs, create an [issue](https://github.com/Plexversal/Fortnite-Stats/issues).

## Code modifications and cloning

If you are looking to modify, clone and use this code. There is a sample `.env` which you can use to enter your own credentials such as your database link. Currently this project uses MongoDB and the mongoose node module.

Epic authentication may change in the future but general auth is with your authentication token, there are many methods to authing and you can find which is best for you.

All stats query the v2 stats endpoint, v2 also has a `startTime` query on the endpoint which can determine when to start looking for stats, all stats start at chapter 2 Season 1 onwards, so for season stats you would find the date for which the season starts and modify accordingly.

You will of course need to host the db and the application yourself if you plan to use. I cannot offer any self hosting support.
