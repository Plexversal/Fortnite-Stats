const discord = require('discord.js');
const path = require('path');
const util = require('util')
const { config } = require('..');

module.exports = class Canvas {


    // NOT COMPLETE - TODO

    /**
   * @param {Object} statData pre-fetched stats data object
   * @param {Object} message message object to retrieve channel and message data
   */

  constructor(statData, message){
    this.statData = statData 
    this.message = message

    }

    async comp(){

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

        let amountofentries = 0

        for (const [key, value] of Object.entries(stats.season.all)) {
            if(key.includes('showdown')){
                Object.entries(value).forEach(function(e) {
                    amountofentries++
                    if(e.includes(`placetop1`)){
                        compWins += e[1];
                        console.log(`${util.inspect(key, true, 4, true)}: ${util.inspect(value, true, 4, true)}`)
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
        }

        let overalltimeplayed = Math.floor((compTime) / 60)
        let overallwinrate = ((compWins / compMatches) * 100).toFixed(2)
        let overallkd = ((compKills / ((compMatches - compWins > 0) ? compMatches - compWins : 1))).toFixed(2)

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
        ctx.fillText(compWins, 55, 146)
        ctx.fillText(overallkd, 145, 146)
        ctx.fillText(`${overallwinrate}%`, 245, 146)
        ctx.fillText(compMatches, 367, 146)
        ctx.fillText(`${overalltimeplayed}hr`, 503, 146)


        ctx.font = '26px Burbank Big Cd Bd'
        ctx.fillStyle = '#ffffff'
        ctx.textAlign = 'center'
        // solos
        if(stats.season.all.showdownalt_solo){
            ctx.fillText(checkLength(stats.season.all.showdownalt_solo.placetop1), 60, 255)
            ctx.fillText(checkLength(stats.season.all.showdownalt_solo.kdr), 110, 255)
            ctx.fillText(`${checkLength(stats.season.all.showdownalt_solo.winrate.toFixed(1))}%`, 175, 255)
            ctx.fillText(checkLength(stats.season.all.showdownalt_solo.matchesplayed), 248, 255)
        }
        // duos
        if(stats.season.all.showdownalt_duos){
            ctx.fillText(checkLength(stats.season.all.showdownalt_duos.placetop1), 60 + 273, 255)
            ctx.fillText(checkLength(stats.season.all.showdownalt_duos.kdr), 110 + 273, 255)
            ctx.fillText(`${checkLength(stats.season.all.showdownalt_duos.winrate.toFixed(1))}%`, 175 + 273, 255)
            ctx.fillText(checkLength(stats.season.all.showdownalt_duos.matchesplayed), 248 + 273, 255)
        }
        // squads
        if(stats.season.all.showdownalt_squad){
            ctx.fillText(checkLength(stats.season.all.showdownalt_squad.placetop1), 60, 354)
            ctx.fillText(checkLength(stats.season.all.showdownalt_squad.kdr), 110, 354)
            ctx.fillText(`${checkLength(stats.season.all.showdownalt_squad.winrate.toFixed(1))}%`, 175, 354)
            ctx.fillText(checkLength(stats.season.all.showdownalt_squad.matchesplayed), 248, 354)
        }
        // trios
        if(stats.season.all.showdownalt_trios){
            ctx.fillText(checkLength(stats.season.all.showdownalt_trios.placetop1), 60 + 273, 354)
            ctx.fillText(checkLength(stats.season.all.showdownalt_trios.kdr), 117 + 273, 354)
            ctx.fillText(`${checkLength(stats.season.all.showdownalt_trios.winrate.toFixed(1))}%`, 180 + 273, 354)
            ctx.fillText(checkLength(stats.season.all.showdownalt_trios.matchesplayed), 248 + 273, 354)
        }

        const embed = new discord.MessageEmbed()
        .setDescription(`**[Add this bot to your server.](${config.discord.invite})**`)
        .setImage(`attachment://season_${stats.user.displayName}.jpg`)
        .setFooter(`Note: If you provided an Xbox, Switch or PSN name instead of EPIC, your stats will not be accurate.`)
        .setColor(config.discord.colors.success)

        function attFile(){
            return new Promise(function(resolve, reject) {
                resolve(embed.attachFiles([{attachment: canvas.toBuffer(), name: `comp_${stats.user.displayName}.jpg`}]));
            });
          }

          attFile().then(async a => await this.message.channel.send(embed))

    }


}