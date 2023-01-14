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

    let go = 0 //absurdité mais ça bypass un putain de return sinon

    await message.deferReply({ephemeral: true})

    bot.db.get(`SELECT * FROM clans WHERE role_id = "${args.get("clan").value}";`, (_, clan) => {

      bot.db.get(`SELECT * FROM membres WHERE membre_id = "${message.user.id}" AND clan_id = "${clan.clan_id}";`, (_, auteur) => {
        if(message.member.permissions.has(Discord.PermissionsBitField.Flags.Administrator) || (auteur && auteur.is_captain)) go = 1
        else return message.editReply("Tu n'es pas le capitaine de ce clan ni administrateur.")
      })

      bot.db.get(`SELECT * FROM membres WHERE membre_id = "${args.get("membre").value}";`, (_, membre) => {

        if((membre && membre.clan_id != "null") || (message.guild.members.cache.get(args.get("membre").value) == undefined)) return message.editReply("Ce membre n'est pas disponible.")
        else{

          let embed = new Discord.EmbedBuilder()
          .setColor(clan.color)
          .setTitle(`${clan.name} (${clan.alias})`)
          .setTimestamp()
          .addFields({name: "Membre trouvé", value: "<@"+args.get("membre").value+">"})

          if(clan.logo_url != "null") embed.setThumbnail(clan.logo_url)

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

          if(go) message.editReply({embeds: [embed], components: [row]})

          collector.on('collect', async i => {
            await i.deferReply()
            if (i.customId === 'confirm_add') {
              bot.db.run(`INSERT INTO membres (membre_id, clan_id, is_captain) VALUES ('${args.get("membre").value}', ${clan.clan_id}, 0)`)
              message.guild.members.cache.get(args.get("membre").value).roles.add(message.guild.roles.cache.get(clan.role_id))
              return await i.editReply("Le membre a été ajouté.")
            } else if (i.customId === 'cancel_add') {
              return await i.editReply("Ajout annulée.")
            }
          })
        }
      })
    })
  }
}
