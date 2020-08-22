const mongoose = require('mongoose')
const discord = require('discord.js')
const { config, guildConfig } = require('../index')
const { dbfind } = require('../handlers/db');
const dedent = require('dedent-js');

module.exports.run = async (client, message, args, settings) => {

    const aliases = `${this.config.name}, ` + this.config.aliases.map(e => `${e}`).join(", ");
    const cName = this.config.name;

    const awaitdata = () => {
        return Promise.resolve(dbfind(message.guild.id))
    }

    const dbdata = await awaitdata();

    if (!message.member.hasPermission("ADMINISTRATOR") && !settings.permissions.mod && !settings.permissions.admin) {
        if (settings.sendReplies)
            return message.reply(`\`ERROR:\` You do not have permission to use the command: \`${cName}\``)
                .catch(e => console.error(e))
        else
            return message.member.send(`\`ERROR:\` You do not have permission to use the command: \`${cName}\``)
                .catch(e => console.error(e))
    };

    if (!message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS"))
    return message.channel.send("I do not have global attach file permissions. You will need to provide me with attach file permissions before using this command.");

    const params = ["channel", "role", "sr"].map(m => m.toLowerCase())

    if (args[0]) args.map(m => m.toLowerCase());

    function embed(title, fieldTitle, fieldContent, inLine) {
        return new discord.MessageEmbed().setColor(config.discord.colors.success)
            .setTitle(title)
            .setFooter(`Available aliases: ${aliases}`)
            .setDescription(`Remove  [ ]  when executing the command. Items in  < >  are user defined parameters.\n`)
            .addField(`${fieldTitle}`, `${fieldContent}`, inLine)
            
    };

    let channelSettingsString = dedent(`\nConfigure channel to allow stat commands, if no channel is set, commands will work everywhere. _(requires permission: Mod)_
    \`\`\`md\n
    ${dbdata.prefix}config [channel] [set] <Channel ID/Channel Mention>
    ${dbdata.prefix}config [channel] [remove] <Channel ID/Channel Mention>
    \`\`\`\n`)

    let roleSettingsString = dedent(`\nConfigure role permissions. Mod and Admin roles relate to setting config and bypass channel/role restrictions if set. If a user role is assigned, only users with this role can use stat commands. _(requires permission: Admin)_
    \`\`\`md\n
    ${dbdata.prefix}config [role] [admin] <Role ID/Role Mention>
    ${dbdata.prefix}config [role] [mod] <Role ID/Role Mention>
    ${dbdata.prefix}config [role] [user] <Role ID/Role Mention>

    ${dbdata.prefix}config [role] [admin] [remove] <Role ID/Role Mention>
    ${dbdata.prefix}config [role] [mod] [remove] <Role ID/Role Mention>
    ${dbdata.prefix}config [role] [user] [remove] <Role ID/Role Mention>
    \`\`\`\n`)

    let srSettingsString = dedent(`\nConfigure if replies to user that fail to execute, e.g. "no permission" are sent in the channel or not. _(requires permission: Mod)_
    \`\`\`md\n
    ${dbdata.prefix}config [sr] <true/false>
    \`\`\`\n`)

    let prefixString = dedent(`\nConfigure the prefix to use for this server. _(requires permission: Admin)_
    \`\`\`md\n
    ${dbdata.prefix}prefix <new prefix>
    \`\`\`\n`)

    class messageReplies {
        constructor() {
            this.idResolvable = /(\d{17,22})/.exec(message.content);
        }

        async validationCheckRole() {
            let resolvedRole = await message.guild.roles.resolve(this.idResolvable[0]);
            return new Promise(function (resolve, reject) {
                resolve(resolvedRole);
                if (err) {
                    const error = {
                        message: `Validation check role error.`,
                        error: err
                    };
                    reject(error);
                }
            })
        }
        async validationCheckChannel() {
            let resolvedRole = await message.guild.channels.resolve(this.idResolvable[0]);
            return new Promise(function (resolve, reject) {
                resolve(resolvedRole);
                if (err) {
                    const error = {
                        message: `Validation check channel error.`,
                        error: err
                    };
                    reject(error);
                }
            })
        }

        async fullSettings(content) {
            await message.channel.send('',
                content.embed.addFields(
                    {name: `Channel config:`, value: `${channelSettingsString}`, inline: false },
                    {name: `Role config:`, value: `${roleSettingsString}`, inline: false },
                    {name: `Prefix config:`, value: `${prefixString}`, inline: false },
                    {name: `Send replies config:`, value: `${srSettingsString}`, inline: false }))
        }
        async channelSettings() {
            await message.channel.send('', embed(`__Configuration Settings__\n`, `Channel Settings Syntax\n`, `${channelSettingsString}`, false))
        }
        async roleSettings() {
            await message.channel.send('', embed(`__Configuration Settings__\n`, `Role Settings Syntax\n`, `${roleSettingsString}`, false))
        }
        async srSettings() {
            await message.channel.send('', embed(`__Configuration Settings__\n`, `Send Replies Settings Syntax\n`, `${srSettingsString}`, false))
        }
    }

    switch (args[0]) {

        // channel config
        case params[0]:

            const validationChannel = () => {
                return Promise.resolve(new messageReplies().validationCheckChannel())
            }
            if (args[1] == `remove`) {
                (async () => {
                    if (!new messageReplies().idResolvable)
                        return message.reply(`\`Error:\` No channel mention or ID provided. Use \`!config\` to see correct syntax.`)

                    if (!await message.guild.channels.resolve(new messageReplies().idResolvable[0]))
                        return message.reply(`\`Error:\` Invalid channel mention or ID provided.`)

                    const validated = await validationChannel()
                    if (dbdata.channels.indexOf(validated.id) == -1)
                        return message.channel.send(`\`Error:\` channel is not set.`)

                    guildConfig.updateOne({ guildID: message.guild.id }, {
                        $pull: { "channels": validated.id }
                    }, function (err, affected) {
                        if (err) console.error(err)
                        return message.channel.send(`Successfully removed ${validated} from stat commands channel.`)
                    })
                    return;
                })()
            }
            // pre channel validation checks
            if (!new messageReplies().idResolvable)
                return new messageReplies().channelSettings()

            if (!await message.guild.channels.resolve(new messageReplies().idResolvable[0]))
                return message.reply(`\`Error:\` Invalid channel mention or ID provided.`)

            const validated = await validationChannel()
            if (dbdata.channels.indexOf(validated.id) > -1)
                return message.channel.send(`\`Error:\` channel is already in channel set. You can remove it using \`!config channel remove ${validated.id}\`.`)

            guildConfig.updateOne({ guildID: message.guild.id }, {
                $push: { "channels": validated.id }
            }, function (err, affected) {
                if (err) console.error(err)
                return message.channel.send(`Successfully set ${validated} as stat commands channel.`)
            })
            break;


        // role config
        case params[1]:

            if (!message.member.hasPermission("ADMINISTRATOR") && !settings.permissions.admin) {
                if (settings.sendReplies)
                    return message.reply(`\`ERROR:\` You do not have permission to use the command: \`${cName}\``)
                        .catch(e => console.error(e))
                else
                    return message.member.send(`\`ERROR:\` You do not have permission to use the command: \`${cName}\``)
                        .catch(e => console.error(e))
            };

            const validationRole = () => {
                return Promise.resolve(new messageReplies().validationCheckRole())
            }
            switch (args[1]) {
                case "admin":

                    if (!args[2]) return message.reply(`\`Error:\` No role mention or ID provided. Use \`!config role\` to see correct syntax.`)
                    if (args[2] == `remove`) {
                        (async () => {
                            if (!new messageReplies().idResolvable)
                                return message.reply(`\`Error:\` No role mention or ID provided. Use \`!config role\` to see correct syntax.`)

                            if (!await message.guild.roles.resolve(new messageReplies().idResolvable[0]))
                                return message.reply(`\`Error:\` Invalid role mention or ID provided.`)

                            const validated = await validationRole()
                            if (dbdata.permissions.Admin.indexOf(validated.id) == -1)
                                return message.channel.send(`\`Error:\` Role is not assigned Admin permissions.`)

                            guildConfig.updateOne({ guildID: message.guild.id }, {
                                $pull: { "permissions.Admin": validated.id }
                            }, function (err, affected) {
                                if (err) console.error(err)
                                return message.channel.send(`Successfully removed ${validated} from Admin permissions.`)
                            })
                            return;
                        })()
                        return;
                    }

                    // pre role validation checks
                    if (!new messageReplies().idResolvable)
                        return message.reply(`\`Error:\` No role mention or ID provided. Use \`!config role\` to see correct syntax.`)

                    if (!await message.guild.roles.resolve(new messageReplies().idResolvable[0]))
                        return message.reply(`\`Error:\` Invalid role mention or ID provided.`)
                    else {
                        (async () => {
                            const validated = await validationRole()
                            if (dbdata.permissions.Admin.indexOf(validated.id) > -1)
                                return message.channel.send(`\`Error:\` Role is already assigned Admin permissions. You can remove it using \`!config role admin remove ${validated.id}\`.`)

                            guildConfig.updateOne({ guildID: message.guild.id }, {
                                $push: { "permissions.Admin": validated.id }
                            }, function (err, affected) {
                                if (err) return console.error(err)
                                return message.channel.send(`Successfully set ${validated} with Admin permissions.`)
                            })
                        })()
                    }
                    break;
                case "mod":
                    if (!args[2]) return message.reply(`\`Error:\` No role mention or ID provided. Use \`!config role\` to see correct syntax.`)
                    if (args[2] == `remove`) {
                        (async () => {
                            if (!new messageReplies().idResolvable)
                                return message.reply(`\`Error:\` No role mention or ID provided. Use \`!config role\` to see correct syntax.`)

                            if (!await message.guild.roles.resolve(new messageReplies().idResolvable[0]))
                                return message.reply(`\`Error:\` Invalid role mention or ID provided.`)

                            const validated = await validationRole()
                            if (dbdata.permissions.Mod.indexOf(validated.id) == -1)
                                return message.channel.send(`\`Error:\` Role is not assigned Mod permissions.`)

                            guildConfig.updateOne({ guildID: message.guild.id }, {
                                $pull: { "permissions.Mod": validated.id }
                            }, function (err, affected) {
                                if (err) console.error(err)
                                return message.channel.send(`Successfully removed ${validated} from Mod permissions.`)
                            })
                            return;
                        })()
                        return;
                    }

                    // pre role validation checks
                    if (!new messageReplies().idResolvable)
                        return message.reply(`\`Error:\` No role mention or ID provided. Use \`!config role\` to see correct syntax.`)

                    if (!await message.guild.roles.resolve(new messageReplies().idResolvable[0]))
                        return message.reply(`\`Error:\` Invalid role mention or ID provided.`)
                    else {
                        (async () => {
                            const validated = await validationRole()
                            if (dbdata.permissions.Mod.indexOf(validated.id) > -1)
                                return message.channel.send(`\`Error:\` Role is already assigned Mod permissions. You can remove it using \`!config role mod remove ${validated.id}\`.`)

                            guildConfig.updateOne({ guildID: message.guild.id }, {
                                $push: { "permissions.Mod": validated.id }
                            }, function (err, affected) {
                                if (err) console.error(err)
                                return message.channel.send(`Successfully set ${validated} with Mod permissions.`)
                            })
                            return;
                        })()
                    }
                    break;
                case "user":
                    if (!args[2]) return message.reply(`\`Error:\` No role mention or ID provided. Use \`!config role\` to see correct syntax.`)
                    if (args[2] == `remove`) {
                        (async () => {
                            if (!new messageReplies().idResolvable)
                                return message.reply(`\`Error:\` No role mention or ID provided. Use \`!config role\` to see correct syntax.`)

                            if (!await message.guild.roles.resolve(new messageReplies().idResolvable[0]))
                                return message.reply(`\`Error:\` Invalid role mention or ID provided.`)

                            const validated = await validationRole()
                            if (dbdata.permissions.User.indexOf(validated.id) == -1)
                                return message.channel.send(`\`Error:\` Role is not assigned User permissions.`)

                            guildConfig.updateOne({ guildID: message.guild.id }, {
                                $pull: { "permissions.User": validated.id }
                            }, function (err, affected) {
                                if (err) console.error(err)
                                return message.channel.send(`Successfully removed ${validated} from User permissions.`)
                            })
                            return;
                        })()
                    }

                    // pre role validation checks
                    if (!new messageReplies().idResolvable)
                        return message.reply(`\`Error:\` No role mention or ID provided. Use \`!config role\` to see correct syntax.`)

                    if (!await message.guild.roles.resolve(new messageReplies().idResolvable[0]))
                        return message.reply(`\`Error:\` Invalid role mention or ID provided.`)
                    else {
                        (async () => {
                            const validated = await validationRole()
                            if (dbdata.permissions.User.indexOf(validated.id) > -1)
                                return message.channel.send(`\`Error:\` Role is already assigned User permissions. You can remove it using \`!config role user remove ${validated.id}\`.`)

                            guildConfig.updateOne({ guildID: message.guild.id }, {
                                $push: { "permissions.User": validated.id }
                            }, function (err, affected) {
                                if (err) console.error(err)
                                return message.channel.send(`Successfully set ${validated} with User permissions. (only mods, admins and users with the role can use stat commands.)`)
                            })
                        })()
                    }
                    break;
                default:
                    return new messageReplies().roleSettings()
            }
            break;

        // sr config
        case params[2]:
            switch (args[1]) {
                case "true":

                    guildConfig.updateOne({ guildID: message.guild.id }, {
                        "sendReplies": true
                    }, function (err, affected) {
                        if (err) console.error(err)
                        return message.channel.send(`Successfully enabled send replies.`)
                    })
                    break;
                case "false":
                    guildConfig.updateOne({ guildID: message.guild.id }, {
                        "sendReplies": false
                    }, function (err, affected) {
                        if (err) console.error(err)
                        return message.channel.send(`Successfully disabled send replies.`)
                    })
                    break

                default:
                    return new messageReplies().srSettings()

            }

            break;

        default:
            await guildConfig.findOne({ guildID: message.guild.id }, async function (err, data) {
                if (err) return console.error(err);
                guildPrefix = data.prefix;
                let guildChannels = []
                await data.channels.forEach(async function (e) {
                    let c = await message.guild.channels.resolve(e)
                    guildChannels.push(c)
                })

                let guildPermissions = { Admin: [], Mod: [], User: [] }
                await data.permissions.Admin.forEach(async function (e) {
                    let r = await message.guild.roles.resolve(e)
                    guildPermissions.Admin.push(r)
                })
                await data.permissions.Mod.forEach(async function (e) {
                    let r = await message.guild.roles.resolve(e)
                    guildPermissions.Mod.push(r)
                })
                await data.permissions.User.forEach(async function (e) {
                    let r = await message.guild.roles.resolve(e)
                    guildPermissions.User.push(r)
                })
                let guildSr = data.sendReplies

                return new messageReplies().fullSettings({
                    embed: embed(`__Configuration Settings__`,
                        `\n**Current ${message.guild.name} Config:**`,
                        `Prefix: **${guildPrefix}**
                Channels: ${guildChannels.length > 0 ? guildChannels.join(", ") : `No channel whitelist configured`}
                Admin Roles: **${guildPermissions.Admin.length > 0 ? guildPermissions.Admin.join(", ") : `No admin roles configured`}**
                Mod Roles: **${guildPermissions.Mod.length > 0 ? guildPermissions.Mod.join(", ") : `No mod roles configured`}**
                User Roles: **${guildPermissions.User.length > 0 ? guildPermissions.User.join(", ") : `No user roles configured`}**
                Send Replies Enabled: **${guildSr}**`, false)
                })

            })

    }
}

module.exports.config = {
    name: "config",
    aliases: ["settings", "setup"],
    description: "Configure settings for the server, including roles to use stats commands, channel restrictions and error reply configuration.",
    permission: ["Admin", "Mod"]
}