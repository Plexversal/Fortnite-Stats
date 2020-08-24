const discord = require('discord.js');
const path = require('path')

module.exports = class Canvas {

    /**
   * @param {Object} statData pre-fetched stats data object
   * @param {Object} message message object to retrieve channel and message data
   */

  constructor(statData, message){
    this.statData = statData
    this.message = message

    }
    
    async overview(){

        let stats = await this.statData
        
        const Canvas = require('canvas')
        Canvas.registerFont(path.join(__dirname, '../', 'assets', 'BurbankBigCondensed-Bold.otf'), { family: 'BurbankBigCondensed-Bold' })

        const canvas = Canvas.createCanvas(600, 400)
        const ctx = canvas.getContext('2d')
        const template = await Canvas.loadImage(path.join(__dirname, '../', 'assets', 'overviewTemplate.jpg'))

        if(!stats.lifetime.all) 
        return this.message.reply(`Error when retrieving data, this could be due to not having enough data to display for **${stats.user.displayName}** or there was an error parsing the display name. Try again using EPIC ID instead`)

        let compWins = 0
        let compMatches = 0
        let compTime = 0
        let compKd = 0
        let compWinrate = 0
        let compKills = 0

        let defaultWins = 0
        let defaultMatches = 0
        let defaultTime = 0
        let defaultKd = 0
        let defaultWinrate = 0
        let defaultKills = 0

        let amountofentries = 0

        for (const [key, value] of Object.entries(stats.lifetime.all)) {
            if(key.includes('showdown')){
                Object.entries(value).forEach(function(e) {
                    amountofentries++
                    if(e.includes(`placetop1`)){
                        compWins += e[1];
                    }
                    if(e.includes(`matchesplayed`)){
                        compMatches += e[1];
                    }
                    if(e.includes(`minutesplayed`)){
                        compTime += e[1];
                    }
                    if(e.includes(`kdr`)){
                        compKd += (e[1] * 100);
                    }
                    if(e.includes(`winrate`)){
                        compWinrate += (e[1] * 100);
                    }
                    if(e.includes(`kills`)){
                        compKills += (e[1]);
                    }
                })

            }
            if(key.includes('default')){
                Object.entries(value).forEach(function(e) {
                    amountofentries++
                    if(e.includes(`placetop1`)){
                        defaultWins += e[1];
                    }
                    if(e.includes(`matchesplayed`)){
                        defaultMatches += e[1];
                    }
                    if(e.includes(`minutesplayed`)){
                        defaultTime += e[1];
                    }
                    if(e.includes(`kdr`)){
                        defaultKd += (e[1] * 100);
                    }
                    if(e.includes(`winrate`)){
                        defaultWinrate += (e[1] * 100);
                    }
                    if(e.includes(`kills`)){
                        defaultKills += (e[1]);
                    }
                })

            }
        }

        let overallwins =  compWins + defaultWins
        let overallmatches = compMatches + defaultMatches
        let overalltimeplayed = Math.floor((compTime + defaultTime) / 60)
        let overallwinrate = ((overallwins / overallmatches) * 100).toFixed(2)
        let overallkills = compKills + defaultKills
        let overallkd = ((overallkills / (overallmatches - overallwins))).toFixed(2)

        let ltmwins = parseInt(stats.lifetime.all.all.placetop1 - (overallwins))
        let ltmmatches = parseInt(stats.lifetime.all.all.matchesplayed - overallmatches)

        ctx.drawImage(template, 0, 0, canvas.width, canvas.height);

        let checkLength = function CheckLength(value){
            if(value.toString().length > 4){
                ctx.font = '22px Burbank Big Cd Bd'
                return value;
            } else if(value.toString().length > 6){
                ctx.font = '16px Burbank Big Cd Bd'
                return value;
            } else {
                ctx.font = '26px Burbank Big Cd Bd'
                return value;
            }
        }

        // display name
        ctx.font = '40px Burbank Big Cd Bd'
        ctx.fillStyle = '#ffffff'
        ctx.textAlign = 'left'
        ctx.fillText(stats.user.displayName, 40, 65)

        // main stats
        ctx.font = '36px Burbank Big Cd Bd'
        ctx.fillStyle = '#ffffff'
        ctx.textAlign = 'center'
        ctx.fillText(overallwins, 55, 146)
        ctx.fillText(overallkd, 145, 146)
        ctx.fillText(`${overallwinrate}%`, 245, 146)
        ctx.fillText(overallmatches, 367, 146)
        ctx.fillText(`${overalltimeplayed}hr`, 503, 146)


        ctx.font = '26px Burbank Big Cd Bd'
        ctx.fillStyle = '#ffffff'
        ctx.textAlign = 'center'
        // solos
        if(stats.lifetime.all.defaultsolo){
        ctx.fillText(checkLength(stats.lifetime.all.defaultsolo.placetop1), 60, 255)
        ctx.fillText(checkLength(stats.lifetime.all.defaultsolo.kdr), 110, 255)
        ctx.fillText(`${checkLength(stats.lifetime.all.defaultsolo.winrate.toFixed(1))}%`, 175, 255)
        ctx.fillText(checkLength(stats.lifetime.all.defaultsolo.matchesplayed), 248, 255)}
        // duos
        if(stats.lifetime.all.defaultduo){
        ctx.fillText(checkLength(stats.lifetime.all.defaultduo.placetop1), 60 + 273, 255)
        ctx.fillText(checkLength(stats.lifetime.all.defaultduo.kdr), 110 + 273, 255)
        ctx.fillText(`${checkLength(stats.lifetime.all.defaultduo.winrate.toFixed(1))}%`, 175 + 273, 255)
        ctx.fillText(checkLength(stats.lifetime.all.defaultduo.matchesplayed), 248 + 273, 255)}
        // squads
        if(stats.lifetime.all.defaultsquad){
        ctx.fillText(checkLength(stats.lifetime.all.defaultsquad.placetop1), 60, 354)
        ctx.fillText(checkLength(stats.lifetime.all.defaultsquad.kdr), 110, 354)
        ctx.fillText(`${checkLength(stats.lifetime.all.defaultsquad.winrate.toFixed(1))}%`, 175, 354)
        ctx.fillText(checkLength(stats.lifetime.all.defaultsquad.matchesplayed), 248, 354)}
        // ltms
        ctx.fillText(checkLength(ltmwins), 60 + 273, 354)
        ctx.fillText(`${stats.season.all.all.minutesplayed ? checkLength(Math.floor(stats.season.all.all.minutesplayed / 60)) : 0}hr`, 117 + 273, 354)
        ctx.fillText(`${checkLength(stats.lifetime.all.all.kills - ((stats.lifetime.defaultsolo ? stats.lifetime.defaultsolo.kills : 0) +
            (stats.lifetime.defaultduo ? stats.lifetime.defaultduo.kills : 0) +
            (stats.lifetime.defaultsquad ? stats.lifetime.defaultsquad.kills : 0)))}`, 180 + 273, 354)
        ctx.fillText(ltmmatches ? checkLength(ltmmatches) : 0, 248 + 273, 354)


        let att = new discord.MessageAttachment(canvas.toBuffer(), `stats_${stats.user.displayName}.jpg`)
        this.message.channel.send(att)
    }

    async season(){

        let stats = await this.statData
        
        const Canvas = require('canvas')
        Canvas.registerFont(path.join(__dirname, '../', 'assets', 'BurbankBigCondensed-Bold.otf'), { family: 'BurbankBigCondensed-Bold' })

        const canvas = Canvas.createCanvas(600, 400)
        const ctx = canvas.getContext('2d')
        const template = await Canvas.loadImage(path.join(__dirname, '../', 'assets', 'seasonTemplate.jpg'))

        if(!stats.season.all) 
        return this.message.reply(`Error when retrieving data, this could be due to not having enough data to display for **${stats.user.displayName}** or there was an error parsing the display name. Try again using EPIC ID instead`)

        let compWins = 0
        let compMatches = 0
        let compTime = 0
        let compKd = 0
        let compWinrate = 0
        let compKills = 0

        let defaultWins = 0
        let defaultMatches = 0
        let defaultTime = 0
        let defaultKd = 0
        let defaultWinrate = 0
        let defaultKills = 0

        let amountofentries = 0

        for (const [key, value] of Object.entries(stats.season.all)) {
            if(key.includes('showdown')){
                Object.entries(value).forEach(function(e) {
                    amountofentries++
                    if(e.includes(`placetop1`)){
                        compWins += e[1];
                    }
                    if(e.includes(`matchesplayed`)){
                        compMatches += e[1];
                    }
                    if(e.includes(`minutesplayed`)){
                        compTime += e[1];
                    }
                    if(e.includes(`kdr`)){
                        compKd += (e[1] * 100);
                    }
                    if(e.includes(`winrate`)){
                        compWinrate += (e[1] * 100);
                    }
                    if(e.includes(`kills`)){
                        compKills += (e[1]);
                    }
                })

            }
            if(key.includes('default')){
                Object.entries(value).forEach(function(e) {
                    amountofentries++
                    if(e.includes(`placetop1`)){
                        defaultWins += e[1];
                    }
                    if(e.includes(`matchesplayed`)){
                        defaultMatches += e[1];
                    }
                    if(e.includes(`minutesplayed`)){
                        defaultTime += e[1];
                    }
                    if(e.includes(`kdr`)){
                        defaultKd += (e[1] * 100);
                    }
                    if(e.includes(`winrate`)){
                        defaultWinrate += (e[1] * 100);
                    }
                    if(e.includes(`kills`)){
                        defaultKills += (e[1]);
                    }
                })

            }
        }

        let overallwins =  compWins + defaultWins
        let overallmatches = compMatches + defaultMatches
        let overalltimeplayed = Math.floor((compTime + defaultTime) / 60)
        let overallwinrate = ((overallwins / overallmatches) * 100).toFixed(2)
        let overallkills = compKills + defaultKills
        let overallkd = ((overallkills / (overallmatches - overallwins))).toFixed(2)

        let ltmwins = parseInt(stats.season.all.all.placetop1 - (overallwins))
        let ltmmatches = parseInt(stats.season.all.all.matchesplayed - overallmatches)

        ctx.drawImage(template, 0, 0, canvas.width, canvas.height);

        let checkLength = function CheckLength(value){
            if(value.toString().length > 4){
                ctx.font = '22px Burbank Big Cd Bd'
                return value;
            } else if(value.toString().length > 6){
                ctx.font = '16px Burbank Big Cd Bd'
                return value;
            } else {
                ctx.font = '26px Burbank Big Cd Bd'
                return value;
            }
        }

        // display name
        ctx.font = '40px Burbank Big Cd Bd'
        ctx.fillStyle = '#ffffff'
        ctx.textAlign = 'left'
        ctx.fillText(stats.user.displayName, 40, 65)

        // main stats
        ctx.font = '36px Burbank Big Cd Bd'
        ctx.fillStyle = '#ffffff'
        ctx.textAlign = 'center'
        ctx.fillText(overallwins, 55, 146)
        ctx.fillText(overallkd, 145, 146)
        ctx.fillText(`${overallwinrate}%`, 245, 146)
        ctx.fillText(overallmatches, 367, 146)
        ctx.fillText(`${overalltimeplayed}hr`, 503, 146)


        ctx.font = '26px Burbank Big Cd Bd'
        ctx.fillStyle = '#ffffff'
        ctx.textAlign = 'center'
        // solos
        if(stats.season.all.defaultsolo){
        ctx.fillText(checkLength(stats.season.all.defaultsolo.placetop1), 60, 255)
        ctx.fillText(checkLength(stats.season.all.defaultsolo.kdr), 110, 255)
        ctx.fillText(`${checkLength(stats.season.all.defaultsolo.winrate.toFixed(1))}%`, 175, 255)
        ctx.fillText(checkLength(stats.season.all.defaultsolo.matchesplayed), 248, 255)}
        // duos
        if(stats.season.all.defaultduo){
        ctx.fillText(checkLength(stats.season.all.defaultduo.placetop1), 60 + 273, 255)
        ctx.fillText(checkLength(stats.season.all.defaultduo.kdr), 110 + 273, 255)
        ctx.fillText(`${checkLength(stats.season.all.defaultduo.winrate.toFixed(1))}%`, 175 + 273, 255)
        ctx.fillText(checkLength(stats.season.all.defaultduo.matchesplayed), 248 + 273, 255)}
        // squads
        if(stats.season.all.defaultsquad){
        ctx.fillText(checkLength(stats.season.all.defaultsquad.placetop1), 60, 354)
        ctx.fillText(checkLength(stats.season.all.defaultsquad.kdr), 110, 354)
        ctx.fillText(`${checkLength(stats.season.all.defaultsquad.winrate.toFixed(1))}%`, 175, 354)
        ctx.fillText(checkLength(stats.season.all.defaultsquad.matchesplayed), 248, 354)}
        // ltms
        ctx.fillText(checkLength(ltmwins), 60 + 273, 354)
        ctx.fillText(`${stats.season.all.all.minutesplayed ? checkLength(Math.floor(stats.season.all.all.minutesplayed / 60)) : 0}hr`, 117 + 273, 354)
        ctx.fillText(`${checkLength(stats.season.all.all.kills - ((stats.season.defaultsolo ? stats.season.defaultsolo.kills : 0) +
            (stats.season.defaultduo ? stats.season.defaultduo.kills : 0) +
            (stats.season.defaultsquad ? stats.season.defaultsquad.kills : 0)))}`, 180 + 273, 354)
        ctx.fillText(ltmmatches ? checkLength(ltmmatches) : 0, 248 + 273, 354)


        let att = new discord.MessageAttachment(canvas.toBuffer(), `stats_${stats.user.displayName}.jpg`)
        this.message.channel.send(att)
    }


}