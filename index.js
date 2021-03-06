
const config = require('./db/config.json')
const util = require('util')
const discord = require('discord.js')
const client = new discord.Client({ fetchAllMembers: false, disableEveryone: true});
const { Client, Communicator, FriendStatus } = require('fortnite-basic-api');
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
    seasonStartTime: '1606867200'
  });

  // const communicator = new Communicator(fnClient);

  // (async () => {
  //   // EMAIL should be same as the account logging in with exchange!
  //   // The reason is that the deviceauth will be saved under "client.email"
  //   // In the JSON file on disk
  
  //   // This is where the magic happen
  //   console.log('Success creation of device auth',
  //     await fnClient.createDeviceAuthFromExchangeCode());
  
  //   // Perform the login process of the "client"
  //   console.log('Success login with created device auth',
  //     await fnClient.authenticator.login());
  
  //   const parallel = await Promise.all([
  //     fnClient.lookup.accountLookup('iXyles'),
  //     fnClient.authenticator.accountId,
  //   ]);
  
  //   (parallel).forEach((result) => {
  //     console.log(result);
  //   });
  
  //   // Node will die and print that the session has been killed if login was successful
  // })();

client.login(process.env.DISCORD_TOKEN);

let retryCount = 0;
(async function loginFn() {
  await fnClient.authenticator.login()
  .then(async function(fn){
      if(fn.error && retryCount < 10){ 
        setTimeout(() => {
          retryCount++
          console.log(`error on login, retrying, count: ${retryCount}`)
          return loginFn()
      }, 10000)
    }
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

