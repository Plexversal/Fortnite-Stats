const invite = require('../db/config.json').discord.invite

module.exports.run = async (client, message) => {

    message.reply(`You can invite this bot to your server using the following link:\n<${invite}>`)
    .catch(e => message.author.send(`You can invite this bot to your server using the following link:\n<${invite}>`)
        .catch(e => console.error(e)))
    
}

module.exports.config = {
    name: "invite",
    aliases: ["inv"],
    description: "Produces a bot invite link for you to invite the bot to your own server or a server you manage.",
    permission: ["User"]
}
