const canvas = require('../handlers/compCanvas')
const { fnClient } = require('../index')
const { dbfind, dbfindEpic } = require('../handlers/db')

module.exports.run = async (client, message, args, settings) => {

    // NOT COMPLETE - TODO

    if(message.author.id !== config.discord.devID) return;
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

    if (!message.channel.permissionsFor(message.guild.me).has("ATTACH_FILES"))
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
        return message.reply(`\`Error:\` No EPIC account is associated with your account. You can link your username using \`${dbdata.prefix}set your epicname\`. To view an epic account, use \`${dbdata.prefix}${this.config.name} epicname\`.`)

        const awaitEpicStats = () => {
            return Promise.resolve(fnClient.stats.getV2Stats(dbEpic.epicID))
        }

        let stats = await awaitEpicStats()
        if(stats.error) return message.reply(stats.error).catch(e => e)
        return await new canvas(stats, message).comp()

    } else {

        let awaitEpicStats = () => {
            return Promise.resolve(fnClient.stats.getV2Stats(args.join(" ")))
        }

        let stats = await awaitEpicStats()
        if(stats.error) return message.reply(stats.error).catch(e => e)
        return await new canvas(stats, message).comp()
    }

    
    
}

module.exports.config = {
    name: "comp",
    aliases: ["arena"],
    description: "View comp and arena season stats for an epic account or your linked epic account.",
    permission: ["dev"]
}
