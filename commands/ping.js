const Discord = require("discord.js")

module.exports = {

  name: "ping",
  description: "Affiche la latence du BOT",
  permission: null,
  dm: true,
  category: "Utilitaire",

  async run(bot, message, args) {
    let ping = Date.now() - message.createdTimestamp
    await message.reply(`BOT ping : \`${ping}\`, API ping : \`${Math.round(bot.ws.ping)}\``)
  }
}
