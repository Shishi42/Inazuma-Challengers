const Discord = require("discord.js")

module.exports = {

  name: "ajouter-membre-clan",
  description: "Ajoute un membre à un clan",
  permission: null,
  dm: false,
  category: "Clans",
  options: [
    {
      type: "role",
      name: "clan",
      description: "Le clan auquel on ajoute des membres",
      required: true
    },
    {
      type: "user",
      name: "membre",
      description: "Membre à ajouter au clan",
      required: true,
      autocomplete: false
    }
  ],

  async run(bot, message, args) {

    await message.deferReply({ephemeral: true})

    let clan = await bot.Clans.findOne({where: {role_id: args.get("clan").value}})
    let auteur = await bot.Members.findOne({where: {member_id: message.user.id, clan_id: clan.dataValues.clan_id}})
    if(!message.member.permissions.has(Discord.PermissionsBitField.Flags.Administrator) && !(auteur && auteur.is_captain === 1)) return message.editReply("Tu n'es pas le capitaine de ce clan ni administrateur.")

    let member = await bot.Members.findAll({where: {member_id: args.get("membre").value}})
    if(member.length) return message.editReply("Ce membre n'est pas disponible.")
    else{

      let embed = new Discord.EmbedBuilder()
      .setColor(clan.color)
      .setTitle(`${clan.name} (${clan.alias})`)
      .setTimestamp()
      .addFields({name: "Membre trouvé", value: "<@"+args.get("membre").value+">"})
      .setFooter({text: 'a BOT by @shishi4272', iconURL: 'https://www.iconpacks.net/icons/2/free-twitter-logo-icon-2429-thumb.png'})

      if(clan.logo_url != null) embed.setThumbnail(clan.logo_url)

      const row = new Discord.ActionRowBuilder()
			.addComponents(
				new Discord.ButtonBuilder()
          .setCustomId("confirm_add")
          .setLabel("Ajouter au clan")
          .setStyle(Discord.ButtonStyle.Success),
        new Discord.ButtonBuilder()
          .setCustomId("cancel_add")
          .setLabel("Annuler")
          .setStyle(Discord.ButtonStyle.Danger)
			)

      const collector = message.channel.createMessageComponentCollector({ time: 15000 })

      message.editReply({embeds: [embed], components: [row]})

      collector.on('collect', async i => {
        await i.deferReply()
        if(i.customId === 'confirm_add') {

          await bot.Members.create({
            member_id: args.get("membre").value,
            clan_id: clan.dataValues.clan_id,
            is_captain: false,
          })

          message.guild.members.cache.get(args.get("membre").value).roles.add(message.guild.roles.cache.get(clan.role_id))
          return await i.editReply("Le membre a été ajouté.")

        } else if(i.customId === 'cancel_add') {
          return await i.editReply("Ajout annulée.")
        }
      })
    }
  }
}
