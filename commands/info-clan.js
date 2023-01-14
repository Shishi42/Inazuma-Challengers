const Discord = require("discord.js")

module.exports = {

  name: "info-clan",
  description: "Affiche les informations d'un clan",
  permission: null,
  dm: true,
  category: "Clans",
  options: [
    {
      type: "role",
      name: "clan",
      description: "Le clan à afficher",
      required: true
    }
  ],

  async run(bot, message, args) {

    let membres = []
    let cap

    bot.db.get(`SELECT * FROM clans WHERE role_id = "${args.get("clan").value}";`, (_, clan) => {

      if (clan === undefined) return message.reply("Pas de clan lié à ce rôle.")

      let embed = new Discord.EmbedBuilder()
      .setColor(clan.color)
      .setTitle(`${clan.name} (${clan.alias})`)
      .setDescription(`Clan ${clan.nationality} | fondé le ${clan.foundation_date}`)
      .setTimestamp()
      if(clan.logo_url != "null") embed.setThumbnail(clan.logo_url)

      if(clan.foundation_date != "null") embed.setDescription(`Clan ${clan.nationality}  | fondé le ${clan.date}`)
      else embed.setDescription(`Clan ${clan.nationality}`)

      bot.db.all(`SELECT * FROM membres WHERE clan_id = "${clan.clan_id}";`, (_, mem) => {
        mem.forEach(m => {
          if(m.is_captain) cap = m
          else membres.push(m.membre_id)
        })

        embed.addFields({name: "Capitaine", value: "<@"+cap.membre_id+">"})
        if(membres != []){
          arr = membres.map(i => '<@' + i + '>');
          embed.addFields({name: "Membres", value: arr.join("\n")})
        }
        message.reply({embeds: [embed]})
      })
    })
  }
}
