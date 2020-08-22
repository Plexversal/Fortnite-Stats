
const { guildConfig } = require('../index')
const { dbfind } = require('../handlers/db');

module.exports.run = async (client, message, args, settings) => {

    const awaitdata = () => {
        return Promise.resolve(dbfind(message.guild.id))
    }

    const dbdata = await awaitdata();

    if(dbdata.channels.length > 0){
        if(!message.member.hasPermission("ADMINISTRATOR") && !settings.permissions.admin){
            if(!dbdata.channels.includes(message.channel.id)) 
            return message.member.send(`\`ERROR:\` You cannot use the command in ${message.channel} as there are channel restrictions set by the server Administrators.`)
            .catch(e => e)

        }
        
    }

    let currentPrefix = dbdata.prefix;

    if(!args[0]){
        return await message.channel.send(`This servers prefix is currently set to \`${currentPrefix}\`. To change this type \`${currentPrefix}prefix <new prefix>\` (requires bot Admin)`)
    }

    if(!message.member.hasPermission("ADMINISTRATOR") && !settings.permissions.admin){
        if(settings.sendReplies) 
            return message.reply(`\`ERROR:\` You do not have permission to use this command.`)
            .catch(e => console.error(e))
        else 
            return message.member.send(`\`ERROR:\` You do not have permission to use this command.`)
            .catch(e => console.error(e))
    }
    
    if(args[1]) {
        return message.channel.send(`\`Error:\` Prefix must be a single string up to 3 characters`)
    }
    
    if(args[0].length < 3){

        guildConfig.updateOne({guildID: message.guild.id}, {
            prefix: args[0]
        }, function(err, affected) {
            if (err) console.error(err)
            message.channel.send(`prefix updated to ${args[0]}`)
        })
        
    } else {
        return message.channel.send(`Cannot update prefix`)
    }

    
}

module.exports.config = {
    name: "prefix",
    aliases: ["suffix"],
    description: "View the current and change the bot prefix for this server.",
    permission: ["User", "Admin"]
}
