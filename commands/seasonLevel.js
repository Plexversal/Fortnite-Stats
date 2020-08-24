const { fnClient, config } = require('../index')
const { dbfind, dbfindEpic } = require('../handlers/db')
const discord = require('discord.js')
const fs = require('fs')
const api = require('../api/api')
const moment = require('moment')

module.exports.run = async (client, message, args, settings) => {

    const aliases = `${this.config.name}, ` + this.config.aliases.map(e => `${e}`).join(", ");

    const awaitdata = () => {
        return Promise.resolve(dbfind(message.guild.id))
    }
    const dbdata = await awaitdata();

    if(dbdata.channels.length > 0){
        if(!message.member.hasPermission("ADMINISTRATOR") && !settings.permissions.mod && !settings.permissions.admin){
            if(!dbdata.channels.includes(message.channel.id)) 
            return message.member.send(`\`ERROR:\` You cannot use the command in ${message.channel} as there are channel restrictions set by the server Administrators.`)
            .catch(e => e)

        }
        
    }

    if(dbdata.permissions.User.length > 0){
        if(!message.member.hasPermission("ADMINISTRATOR") && !settings.permissions.user && !settings.permissions.mod && !settings.permissions.admin){
            if(settings.sendReplies) 
                return message.reply(`\`ERROR:\` You do not have permission to use this command.`)
                .catch(e => console.error(e))
            else 
                return message.member.send(`\`ERROR:\` You do not have permission to use this command.`)
                .catch(e => console.error(e))
        }
    }
    if (!message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS"))
    return message.channel.send("I do not have global attach file permissions. You will need to provide me with attach file permissions before using this command.");

    // timer
    if(client.timers.get(message.member.id) && (Date.now() - client.timers.get(message.member.id).time) < 6000){
        return message.reply('You are sending requests too quickly! Slow down.')
    } else {
        client.timers.set(message.member.id, { "time": Date.now() })
    }

    const awaitEpic = () => {
        return Promise.resolve(dbfindEpic(message.member.id))

    }
    const dbEpic = await awaitEpic();

    if(!args[0]) {
        
        if (!dbEpic || !dbEpic.userID == message.member.id) 
        return message.reply(`\`Error:\` No EPIC account is associated with your account. You can link your username using \`${dbdata.prefix}set <your epic username>\`. To view an epic account, use \`${dbdata.prefix}stats <epicname>\`.`)

        const awaitEpicStats = () => {
            return Promise.resolve(fnClient.stats.getV2Stats(dbEpic.epicID))
        }

        let stats = await awaitEpicStats()
        if(stats.error) return message.reply(stats.error).catch(e => e)
        let id = stats.user.id

        const awaitLevel = () => {
            return Promise.resolve(new api().level(id))
        }

        let level = await awaitLevel()

        let embed = new discord.MessageEmbed()
            .setColor(config.discord.colors.success)
            .setTitle(`Season Level for **${stats.user.displayName}**`)
            .setFooter(`This is an experimental feature, data may not be fully accurate/not show at all.`)
            .addFields([
                {
                    name: `Last Updated`, 
                    value: (`${moment(stats.lifetime.all.all.lastmodified * 1000).format('MMM Do YYYY, HH:mm')} UTC`), 
                    inline: true
                },
                {
                    name: `Current Level`, 
                    value: (`${level[0].stats.s13_social_bp_level ? `${(level[0].stats.s13_social_bp_level / 100).toFixed(0)}` : `No Data`}`), 
                    inline: true
                }

            ])

        if(stats.error) return message.reply(stats.error).catch(e => e)
        return await message.channel.send(embed)

    } else {
        let awaitEpicStats = () => {
            return Promise.resolve(fnClient.stats.getV2Stats(args.join(" ")))
        }

        let stats = await awaitEpicStats()
        if(stats.error) return message.reply(stats.error).catch(e => e)
        let id = stats.user.id

        const awaitLevel = () => {
            return Promise.resolve(new api().level(id))
        }
        let level = await awaitLevel()
        fs.writeFile('extract.json', JSON.stringify(level, null, 4), (err) => {
            if(err) return console.error(err)
        })
        let embed = new discord.MessageEmbed()
            .setColor(config.discord.colors.success)
            .setTitle(`Season Level for **${stats.user.displayName}**`)
            .setFooter(`This is an experimental feature, data may not be fully accurate/not show at all.`)
            .addFields([
                {
                    name: `Last Updated`, 
                    value: (`${moment(stats.lifetime.all.all.lastmodified * 1000).format('MMM Do YYYY, HH:mm')} UTC`), 
                    inline: true
                },
                {
                    name: `Current Level`, 
                    value: (`${level[0].stats.s13_social_bp_level ? `${(level[0].stats.s13_social_bp_level / 100).toFixed(0)}` : `No Data`}`), 
                    inline: true
                }

            ])

        if(stats.error) return message.reply(stats.error).catch(e => e)
        return await message.channel.send(embed)
    }

    
    
}

module.exports.config = {
    name: "level",
    aliases: ["seasonlevel", "sl"],
    description: "View the your current season level. This command is still experimental. Permissions: User",
    permission: ["User"]
}
