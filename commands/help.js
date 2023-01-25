const Discord = require("discord.js")

module.exports = {

  name: "help",
  description: "Affiche le menu d'aide",
  permission: null,
  dm: true,
  category: "Utilitaire",
  options: [
    {
      type: "string",
      name: "commande",
      description: "La commande à afficher",
      required: false,
      autocomplete: true,
    }
  ],

  async run(bot, message, args) {

    let command
    if(args.get("commande")){
      command = bot.commands.get(args.get("commande").value)
      if(!command) return message.reply("Pas de commande à ce nom")
    }

    if(!command){

      let categories = []
      bot.commands.forEach(command => {
        if(!categories.includes(command.category)) categories.push(command.category)
      })

      let embed = new Discord.EmbedBuilder()
      .setColor(bot.color)
      .setTitle("Commandes du bot")
      .setThumbnail(bot.user.displayAvatarURL({dynamic: true}))
      .setDescription(`Commandes disponibles : \`${bot.commands.size}\` \nCatégories disponibles : \`${categories.length}\``)
      .setFooter({text: 'a BOT by @shishi4272', iconURL: 'https://www.iconpacks.net/icons/2/free-twitter-logo-icon-2429-thumb.png'})
      .setTimestamp()

      await categories.sort().forEach(async cat => {
        let commands = bot.commands.filter(cmd => cmd.category === cat)
        embed.addFields({name: `${cat}`, value: `${commands.map(cmd => `\`${cmd.name}\` : ${cmd.description}`).join("\n")}`})
      })

      await message.reply({embeds: [embed]})

    } else {

      let embed = new Discord.EmbedBuilder()
      .setColor(bot.color)
      .setTitle(`Commande **${command.name}**`)
      .setThumbnail(bot.user.displayAvatarURL({dynamic: true}))
      .setDescription(`Nom : \`${command.name}\` \nDescription : \`${command.description}\` \nPermission requise : \`${typeof command.permission !== "bigint" ? command.permission !== null ? command.permission : "Aucune" : new Discord.PermissionsBitField(command.permission).toArray(false)}\` \nCommande en DM : \`${command.dm ? "Oui" : "Non"}\` \nCatégorie : \`${command.category}\``)
      .setTimestamp()
      .setFooter({text: 'a BOT by @shishi4272', iconURL: 'https://www.iconpacks.net/icons/2/free-twitter-logo-icon-2429-thumb.png'})

      await message.reply({embeds: [embed]})
    }
  }
}
