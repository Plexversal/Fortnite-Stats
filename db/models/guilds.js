const mongoose = require('mongoose');
const Schema = mongoose.Schema
const guildSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    guildID: String,
    prefix: String,
    permissions: Object,
    channels: Array,
    commandStats: Number,
    sendReplies: Boolean
})

module.exports = mongoose.model("guild", guildSchema, `guilds`)