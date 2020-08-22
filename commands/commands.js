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
        return message.channel.send("I do not have global attach file permissions. You will need to provide me with attach file permissions before using this command.")
    .catch(e => 
        message.member.send(`I do not have global embed permissions. You will need to provide me with embed permissions before using this command.`).catch(e => e))

    let allpubliccmds = client.commands.filter(a => !a.config.permission.includes("dev"))
    let commands = allpubliccmds.array().map(e => `\`${dbdata.prefix}${e.config.name}\`: ${e.config.description} Permissions: **${e.config.permission.map(e => e).join(", ")}**`).sort().reverse().join("\n\n")
    


    function embed(title, body){
        return new discord.MessageEmbed()
        .setColor(config.discord.colors.success)
        .setTitle(title)
        .setDescription(body)
        .setFooter(`Available Aliases: ${aliases}`)
    }
    
    let title = dedent(`Command List`)
    let body = commands
   
    await message.channel.send(``, embed(title, body))
    .catch(e => message.member.send(`Error occured when sending request: ${e}`))
    .catch(e => e)
   
}

module.exports.config = {
    name: "commands",
    aliases: ["cmds", "commandlist", "cmdlist"],
    description: "Produces a list of available commands to use and the permissions needed to use them.",
    permission: ["User"]
}
