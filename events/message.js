const { guildConfig } = require('../index')
const Permissions = require('../handlers/perms')
const { dbfind } = require('../handlers/db')
const guildCreate = require('../events/guildCreate')


module.exports = async (client, message) => {

    // command handler
    if(message.channel.type != "dm" && !message.author.bot){

        const awaitdata = () => {
            return new Promise((resolve, reject) => {
                resolve(dbfind(message.guild.id))
                reject(`Error on db find`)
            })
        }
        awaitdata().catch(e => {
            console.log(`error with db read ${e}, guild: ${message.guild.id}, member: ${message.author.id}, time: ${new Date(Date.now())}`); 
        }) 
    
        const dbdata = await awaitdata();
        

        if(!dbdata) {
            console.log(`Guild: ${message.guild.id} is not in database`)
            return guildCreate(client, message.guild)
        }
        if(!message.content.startsWith(dbdata.prefix)) return;

            let sendReplies = await dbdata.sendReplies

            let perms = new Permissions(dbdata.permissions, message.channel.guild, message.member)
            await perms.checkRole();
            let admin = perms.adminBool
            let mod = perms.modBool;
            let user = perms.userBool;


            let settings = {
                "permissions": {                
                    "admin": admin, 
                    "mod": mod, 
                    "user": user},
                "sendReplies": sendReplies
            }
            
            let command = message.content.split(/\s+/g)[0].toLowerCase()
            let args = message.content.split(/\s+/g).slice(1)
            if(message.content.startsWith(dbdata.prefix)) return runCommand(client, message, args, settings)


            function runCommand(client, message, args, settings){

                if(!message.channel.permissionsFor(client.user.id).has("SEND_MESSAGES"))
                return message.author.send(`Insufficient permissions to send messages in ${message.channel}.`)
                .catch(e => e)

                let commandFile = client.commands.get(command.slice(dbdata.prefix.length)) || client.aliases.get(command.slice(dbdata.prefix.length))
                if(commandFile) commandFile.run(client, message, args, settings)
                guildConfig.updateOne({guildID: message.guild.id}, {
                    $inc: { "commandStats": 1 }
                }, function(err, affected){
                    if (err) console.error(err)
                })
            }

    }
    


}
