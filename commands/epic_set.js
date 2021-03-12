const { fnClient, userConfig } = require('../index')
const { dbfind } = require('../handlers/db')
const { dbfindEpic } = require('../handlers/db')
const mongoose = require('mongoose');
const util = require('util')

module.exports.run = async (client, message, args, settings) => {

    const awaitdata = () => {
        return Promise.resolve(dbfind(message.guild.id))
    }
    const dbdata = await awaitdata();

    if(dbdata.channels.length > 0){
        if(!message.member.hasPermission("ADMINISTRATOR") && !settings.permissions.mod && !settings.permissions.admin){
            if(!dbdata.channels.includes(message.channel.id)) 
            return message.member.send(`\`ERROR code 1:\` You cannot use the command in ${message.channel} as there are channel restrictions set by the server Administrators.`)
            .catch(e => e)

        }
        
    }

    if(dbdata.permissions.User.length > 0){
        if(!message.member.hasPermission("ADMINISTRATOR") && !settings.permissions.user && !settings.permissions.mod){
            if(settings.sendReplies) 
                return message.reply(`\`ERROR code 2:\` You do not have permission to use this command.`)
                .catch(e => console.error(e))
            else 
                return message.member.send(`\`ERROR code 3:\` You do not have permission to use this command.`)
                .catch(e => console.error(e))
        }
    }

    const awaitEpic = () => {
        return Promise.resolve(dbfindEpic(message.member.id))

    }
    const dbEpic = await awaitEpic();

    try {

        if(!args[0]) return message.reply('\`Error code 4:\` Please enter a valid EPIC username.')
        if(/your\sepicname/g.test(args.join(" "))) return message.reply(`\`Error:\` Looks like you're the type of person to write "your name" in the name section on a test paper. Grow a second brain cell and try again.`)
        if(args[0].toLowerCase() == `epic_default`) {
            userConfig.deleteOne({userID: message.member.id}, (err) => {
                if(err) message.channel.send(`'\`Error code 5:\`Could not remove link: ${err}`)
            })
            return message.reply(`Successfully removed epic account link.`)
        }

        const accountdata = () => {
            return Promise.resolve(fnClient.lookup.accountLookup(args.join(" ")))
        }

        if (dbEpic && dbEpic.userID == message.member.id) {
        return message.channel.send(`\`Error code 6:\` You already linked the EPIC account: **${dbEpic.epicName}**. You can remove the link using \`${dbdata.prefix}set epic_default\`.`)}

            const epicAccount = await accountdata();
            if(epicAccount.error || epicAccount.errorMessage) {
            return message.reply(`\`Error code 7:\` ${epicAccount.errorMessage ? `${epicAccount.errorMessage}` : `${epicAccount.error ? `${epicAccount.error.errorMessage || epicAccount.error}` : `An unknown error occured, please try again later!`}`}`)
            }
            const userModel = new userConfig({
                _id: mongoose.Types.ObjectId(),
                userID: message.member.id,
                epicName: epicAccount.displayName,
                epicID: epicAccount.id
            })
            await userModel.save();
            message.reply(`Successfully set epic account to: \`${epicAccount.displayName}\`.`)

    } catch (error) {
        console.error(error)
        return message.channel.send(`\`Error code 8:\` ${typeof error.message === 'object' ? util.inspect(error.message, true, 4) : error.message}`)
    }
    
}

module.exports.config = {
    name: "set",
    aliases: ["setepic", "set_epic", "link"],
    description: "Link your epic account to your discord account allowing you to use stat commands in all servers this bot is in and saves from typing your name everytime.",
    permission: ["User"]
}
