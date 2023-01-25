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

    let clan_members = []
    let cap

    let clan = await bot.Clans.findOne({where: {role_id: args.get("clan").value}})
    if (clan === undefined) return message.reply("Pas de clan lié à ce rôle.")

    let embed = new Discord.EmbedBuilder()
    .setColor(clan.dataValues.color)
    .setTitle(`${clan.dataValues.name} (${clan.dataValues.alias})`)
    .setTimestamp()
    .setFooter({text: 'a BOT by @shishi4272', iconURL: 'https://www.iconpacks.net/icons/2/free-twitter-logo-icon-2429-thumb.png'})
    if(clan.dataValues.logo_url) embed.setThumbnail(clan.logo_url)

    if(clan.dataValues.found_date) embed.setDescription(`Clan ${clan.dataValues.nationality}  | fondé le ${clan.dataValues.found_date}`)
    else embed.setDescription(`Clan ${clan.dataValues.nationality}`)




    let members = await bot.Members.findAll({where: {clan_id: clan.dataValues.clan_id}})

    for(member of members){
      if(member.dataValues.is_captain) cap = member
      else{
        clan_members.push(member)
      }
    }
    embed.addFields({name: "Capitaine", value: "<@"+cap.dataValues.member_id+">"})

    if(clan_members.length >= 1){
      res = ""
      for(member of clan_members){
        res += '<@' + member.dataValues.member_id + '>\n'
      }
      embed.addFields({name: "Membres", value: res})
    }
    message.reply({embeds: [embed]})
  }
}
