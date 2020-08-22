const { userConfig, guildConfig } = require('../index')


exports.dbfind = function (guildid) {
        return new Promise(function(resolve, reject) {
            guildConfig.findOne({guildID: guildid}, (err, res) => {
                resolve(res)
                if(err) { const error = {
                    message: `Lookup error occured in guild lookup. GUILD ID: ${guildid}`,
                    error: err
                };
                reject(error)
            }
        })
    })
}

exports.dbfindEpic = function (userid) {
    return new Promise(function(resolve, reject) {
        userConfig.findOne({userID: userid}, (err, res) => {
            resolve(res)
            if(err) { const error = {
                message: `Lookup error occured in user epic lookup. USER ID: ${userid}`,
                error: err
            };
            reject(error)
        }
    })
})
}

