const { config } = require('../index')
const { dbfind } = require('../handlers/db')
const discord = require('discord.js')
const dedent = require('dedent-js')

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

    function embed(title, body){
        return new discord.MessageEmbed()
        .setColor(config.discord.colors.success)
        .addField(title, body, true)
        .setFooter(`Available Aliases: ${aliases}`)
    }
    
    let title = dedent(`Fortnite Stats`)
    let body = dedent(`Thank you for using **${client.user.username}**!\n
    The default prefix is **${config.discord.defaultPrefix}**, you can change this using\`${dbdata.prefix}prefix <new prefix>\`.\n
    To see all commands available, use \`${dbdata.prefix}commands\`.\n
    By default, all users can use the designated \`stats\` and \`season\` commands and in any channel. To change who can use the bot and where, you will need to set a user role, members with this role can execute commands.\n
    To make it so users can only execute commands in certain channels, you will need to set a default channel.\n
    To configure these settings use \`${dbdata.prefix}config\`. To see all commands available, use \`${dbdata.prefix}commands\`.\n
    To invite this bot to another server, you can use the \`${dbdata.prefix}invite\` command.`)
   
    await message.channel.send(``, embed(title, body))
    
    
}

module.exports.config = {
    name: "help",
    aliases: [],
    description: "General help on how to setup the bot.",
    permission: ["User"]
}

