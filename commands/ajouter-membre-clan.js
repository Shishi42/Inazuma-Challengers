const Discord = require("discord.js")

module.exports = {

  name: "ajouter-membre-clan",
  description: "Ajoute des membres à un clan",
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
      type: "string",
      name: "membres",
      description: "Liste des membres à ajouter au clan",
      required: true,
      autocomplete: false
    }
  ],

  async run(bot, message, args) {

    let go = 0 //absurdité mais ça bypass un putain de return sinon

    await message.deferReply({ephemeral: true})

    bot.db.get(`SELECT * FROM clans WHERE role_id = "${args.get("clan").value}";`, (_, clan) => {

      bot.db.get(`SELECT * FROM membres WHERE membre_id = "${message.user.id}" AND clan_id = "${clan.clan_id}";`, (_, mem) => {
        if(message.member.permissions.has(Discord.PermissionsBitField.Flags.Administrator) || (mem && mem.is_captain)) go = 1
        else return message.editReply("Tu n'es pas le capitaine de ce clan ni administrateur.")
      })

      if(!args.get("membres").value) return message.editReply("La liste de membres fournit est vide.")
      else {

        bot.db.all(`SELECT * FROM membres;`, (_, membres) => {
          let found = args.get("membres").value.split(" ").filter(member => message.guild.members.cache.get(member) != undefined)
          let found_but_taken = []
          for(membre of membres){
            if(found.includes(membre.membre_id)) found_but_taken.push(membre.membre_id)
          }

          let not_found = args.get("membres").value.split(" ").filter(x => !found.includes(x))
          found = found.filter(x => !found_but_taken.includes(x))

          let embed = new Discord.EmbedBuilder()
          .setColor(clan.color)
          .setTitle(`${clan.name} (${clan.alias})`)
          .setTimestamp()

          if(clan.logo_url != "null") embed.setThumbnail(clan.logo_url)

          // console.log(found)
          // console.log(found_but_taken)
          // console.log(not_found)

          if(found != []){
            arr = found.map(i => '<@' + i + '>');
            embed.addFields({name: "Membres trouvés", value: arr.join("\n")})
          }
          if(found_but_taken != []){
            arr = found_but_taken.map(i => '<@' + i + '>');
            embed.addFields({name: "Membres trouvés mais non-disponibles", value: arr.join("\n")})
          }
          if(not_found != []) embed.addFields({name: "Membres non-trouvés", value: not_found.join("\n")})

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
              found.forEach(f => {
                bot.db.run(`INSERT INTO membres (membre_id, clan_id, is_captain) VALUES ('${f}', ${clan.clan_id}, 0)`)
                message.guild.members.cache.get(f).roles.add(message.guild.roles.cache.get(clan.role_id))
              })
              return await i.editReply("Les membres ont été ajouté.")
            } else if (i.customId === 'cancel_add') {
              return await i.editReply("Ajout annulée.")
            }
          })
        })
      }
    })
  }
}
