
const config = require('./db/config.json')
const util = require('util')
const discord = require('discord.js')
const client = new discord.Client({ fetchAllMembers: false, disableEveryone: true});
const { Client } = require('fortnite-basic-api');
const fs = require('fs').promises;
const path = require('path')
const mongoose = require('mongoose')
const guildConfig = require('./db/models/guilds')
const userConfig = require('./db/models/users')
require('dotenv').config();


client.commands = new discord.Collection()
client.aliases = new discord.Collection()
client.timers = new discord.Collection()
client.descriptions = new discord.Collection()
client.cmdPermissions = new discord.Collection()

  const fnClient = new Client({
    email: process.env.FORTNITE_EMAIL,
    useDeviceAuth: true,
    removeOldDeviceAuths: true,
    deviceAuthPath: './fbadeviceauths.json',
    // These tokens are static.
    launcherToken: 'MzRhMDJjZjhmNDQxNGUyOWIxNTkyMTg3NmRhMzZmOWE6ZGFhZmJjY2M3Mzc3NDUwMzlkZmZlNTNkOTRmYzc2Y2Y=',
    fortniteToken: 'ZWM2ODRiOGM2ODdmNDc5ZmFkZWEzY2IyYWQ4M2Y1YzY6ZTFmMzFjMjExZjI4NDEzMTg2MjYyZDM3YTEzZmM4NGQ=',
    autokill: true,
    seasonStartTime: '1598504400'
  });

client.login(process.env.DISCORD_TOKEN);

let retryCount = 0;
(async function loginFn() {
  await fnClient.authenticator.login()
  .then(function(fn){
    if(fn.error && retryCount < 10) setTimeout(() => {
      retryCount++
      console.log(`error on login, retrying, count: ${retryCount}`)
      return loginFn()
    }, 10000)
  console.log(`Fortnite client sign in: ${util.inspect(fn, true, 4, true)}`)
  })
})()

fs.readdir(path.join(__dirname, 'events'))
.then(files => {
  files.forEach(f => {
    let eventName = f.substring(0, f.indexOf('.js'));
    let eventModule = require(path.join(__dirname, 'events', eventName)) 
    console.log(`${eventName} event Loaded.`)

    client.on(eventName, eventModule.bind(null, client))
  })
  console.log(`-All events Loaded-\n`)
})
.catch(e => console.log(e))

fs.readdir(path.join(__dirname, 'commands'))
.then(files => {
  files.forEach(f => {
    let commandName = f.substring(0, f.indexOf('.js'));
    let file = require(path.join(__dirname, 'commands', commandName))
    console.log(`${commandName} command Loaded.`)
    if(!file.config) return;

    client.commands.set(file.config.name, file)
    file.config.aliases.forEach(a => {
      client.aliases.set(a, file)
    })
    client.descriptions.set(file.config.description, file)
    file.config.permission.forEach(a => {
      client.cmdPermissions.set(a, file)
    })
  })
  console.log(`-All commands Loaded-\n`)
})
mongoose.set('useUnifiedTopology', true);
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true });


exports.fnClient = fnClient;
exports.userConfig = userConfig;
exports.guildConfig = guildConfig;
exports.config = config;

