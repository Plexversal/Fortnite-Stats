const discord = require('discord.js')
const mongoose = require('mongoose');
const { config, guildConfig } = require('../index')
const { dbfind } = require('../handlers/db');

module.exports = async (client, guild) => {

    if(!guild.id) return;

    const awaitdata = () => {
        return Promise.resolve(dbfind(guild.id))
    }
    const dbdata = await awaitdata();
    if(dbdata) return console.log(`guild added but already in database`)

    const guildModel = new guildConfig({
        _id: mongoose.Types.ObjectId(),
        guildID: guild.id,
        prefix: config.discord.defaultPrefix,
        permissions: {"Mod": [], "Admin": [], "User": []},
        channels: [],
        commandStats: 0,
        sendReplies: true
    })

    guildModel.save()

    console.log(`New guild added to database: ${guild.id}`)

    let embed = new discord.MessageEmbed()
    .setTitle(`Fortnite BR Stats Bot`)
    .setDescription(`Thank you for using ${client.user.username} on ${guild.name}!\n
    You can use !commands in your server to see all available commands.
    You can use !config or !settings in your server to setup permissions correctly\n
    If you encounter any issues or bugs you can contact the owner Plexversal#9999, create a new issue on [Github](https://github.com/Plexversal/Fortnite-Stats/issues) or Message on [Twitter](https://twitter.com/Plexversal)`)

    guild.owner.send(embed)
    .catch(e => console.log(e))


}