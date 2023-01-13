const Discord = require("discord.js")

module.exports = {

  name: "info-clan",
  description: "Affiche les informations d'un clan",
  permission: null,
  dm: true,
  options: [
    {
      type: "role",
      name: "clan",
      description: "Le clan à afficher",
      required: true
    }
  ],

  async run(bot, message, args) {

    let clan_role = args.get("clan").value
    let membres = []

    bot.db.get(`SELECT * FROM clans WHERE role_id = "${clan_role}";`, (_, clan) => {

      if (clan === undefined) return message.reply("Pas de clan lié à ce rôle.")

      let embed = new Discord.EmbedBuilder()
      .setColor(clan.color)
      .setTitle(`${clan.name} (${clan.alias})`)
      .setThumbnail(clan.logo_url)
      .setDescription(`Clan ${clan.nationality} | fondé le ${clan.foundation_date}`)
      .setTimestamp()

      bot.db.all(`SELECT * FROM membres WHERE clan = "${clan.clan_id}";`, (_, mem) => {
        mem.forEach(m => {
          membres.push(m.membre_id)
        })
        embed.addFields({name: "Membres", value: membres.join("\n")})
        message.reply({embeds: [embed]})
      })
    })
  }
}
