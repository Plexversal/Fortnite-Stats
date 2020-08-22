const { fnClient, config, userConfig, guildConfig } = require('../index')
const { dbfind, dbfindEpic } = require('../handlers/db')
const api = require('../api/api');
const discord = require('discord.js')
const mongoose = require('mongoose');
const util = require('util')
const fs = require('fs')

module.exports.run = async (client, message) => {

    const awaitdata = () => {
        return Promise.resolve(dbfind(message.guild.id))
    }
    const dbdata = await awaitdata();

    if(message.author.id !== config.discord.devID) return;
    const args = message.content.split(" ").slice(1);

    if(!args[0]) return message.channel.send(`Invalid code parameter`)
    
    if (!message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS"))
    return message.channel.send("I do not have global attach file permissions. You will need to provide me with attach file permissions before using this command.");

    var code = args.join(" ")
    const aliases = `${this.config.name}, ` + this.config.aliases.map(e => `${e}`).join(", ");


    let embed = (input, output, error = false) => new discord.MessageEmbed().setColor(error ? config.discord.colors.error : config.discord.colors.success)
    .addField("Input", input)
    .addField(error ? "Error" : "Output", `\`\`\`js\n${output}\n\`\`\``)
    .setFooter(`Available aliases: ${aliases}`);

    try {
        let evaled = await eval(code);
        if (evaled instanceof Promise) {

        evaled.then(output => {
            return message.channel.send(embed(code, output instanceof Object ? `Output fulfilled with Promise: ${util.inspect(output, false, 0, false)}` : output));
        }).catch(e => {
            return message.channel.send(embed(code, e, true));
            });
        }       
        else {
            return message.channel.send(embed(code, evaled instanceof Object ? `Output fulfilled with Promise: ${util.inspect(evaled, false, 0, false)}` : evaled));
            }
    }  
    catch (err) {
        message.channel.send(embed(code, err, true));
    }

};

module.exports.config ={
    name: "eval",
    aliases: ["ev"],
    description: "Eval",
    permission: ["dev"]
}