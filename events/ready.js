const dedent = require('dedent-js')

module.exports = (client) => {
    client.user.setActivity("!help", {type: "PLAYING"})
    console.log(dedent(
    `Guilds: ${client.guilds.cache.size}
    Users: ${client.users.cache.size}
    Discord client Ready At: ${client.readyAt}`))
}