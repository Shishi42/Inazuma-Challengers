const Discord = require("discord.js")

module.exports = {

  name: "creer-clan",
  description: "Créer un clan, un role et ajoute en base de données",
  permission: Discord.PermissionFlagsBits.Administrator,
  dm: true,
  category: "Clans",
  options: [
    {
      type: "string",
      name: "nom",
      description: "Le nom du clan",
      required: true,
      autocomplete: false,
    },
    {
      type: "string",
      name: "alias",
      description: "L'alias du clan (exemple: FK)",
      required: true,
      autocomplete: false,
    },
    {
      type: "user",
      name: "capitaine",
      description: "Le capitaine du clan",
      required: true
    },
    {
      type: "string",
      name: "couleur",
      description: "La couleur associée au clan (exemple: FFFFFF)",
      required: true,
      autocomplete: false,
    },
    {
      type: "string",
      name: "logo",
      description: "Un lien vers une image du logo du clan",
      required: false,
      autocomplete: false,
    },
    {
      type: "string",
      name: "date",
      description: "Date de fondation du clan",
      required: false,
      autocomplete: false,
    },
    {
      type: "string",
      name: "nationalité",
      description: "Nationalité principale du clan (un émoji de drapeau, par défaut international)",
      required: false,
      autocomplete: false,
    },
    // {
    //   type: "string",
    //   name: "membres",
    //   description: "Liste d'id Discord de membres du clan (exemple: 1 2 3 4)",
    //   required: false,
    //   autocomplete: false,
    // }
  ],

  async run(bot, message, args) {

    await message.deferReply()

    function isURL(str) {
      var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
      '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
      return pattern.test(str);
    }

    err = ""

    if(!/^([^0-9]*)$/.test(args.get("alias").value) || args.get("alias").value != args.get("alias").value.toUpperCase()) err += "Format d'alias invalide (uniquement lettres majuscules, exemple: \"XXX\")\n"
    if(!/^([0-9a-f]{3}){1,2}$/i.test(args.get("couleur").value)) err += "Format de couleur invalide. (code couleur hex sans #, exemple: FFFFFF)\n"
    if(args.get("logo") && !isURL(args.get("logo").value)) err += "Format de logo invalide. (lien URL vers une image)\n"
    if(args.get("date") && !/^[0-3]?[0-9].[0-3]?[0-9].(?:[0-9]{2})?[0-9]{2}$/.test(args.get("date").value)) err += "Format de date invalide. (exemple: 1/1/2000)\n"
    if(args.get("nationalité") && !/[\uD83C][\uDDE6-\uDDFF][\uD83C][\uDDE6-\uDDFF]/.test(args.get("nationalité").value)) err += "Format de drapeau invalide. (exemple: :flag_fr:)\n"

    bot.db.all(`SELECT * FROM clans;`, (_, clan) => {

      clan.forEach(c => {
        if(c.name == args.get("nom").value) err += "Nom de clan déjà pris.\n"
        if(c.alias == args.get("alias").value) err += "Alias de clan déjà pris.\n"
        if(c.captain_id == args.get("capitaine").value) err += "Cette personne est déjà capitaine d'un autre clan.\n"
        if(c.color == args.get("couleur").value) err += "Couleur de clan déjà prise.\n"
      })

      if(err != "") return message.editReply(err)

      let embed = new Discord.EmbedBuilder()
      .setColor(args.get("couleur").value)
      .setTitle(`${args.get("nom").value} (${args.get("alias").value})`)
      .setTimestamp()

      if(args.get("logo")) embed.setThumbnail(args.get("logo").value)
      if(args.get("date")) embed.setDescription(`Clan ${args.get("nationalité").value? args.get("nationalité").value : "🇺🇳"}  | fondé le ${args.get("date").value}`)
      else embed.setDescription(`Clan ${args.get("nationalité")? args.get("nationalité").value : ":united_nations:"}`)

      embed.addFields({name: "Capitaine", value: '<@'+args.get("capitaine").value+'>'})

      if(args.get("membres")) embed.addFields({name: "Membres", value: args.get("membres").value.split(" ").join("\n")})

      const row = new Discord.ActionRowBuilder()
			.addComponents(
				new Discord.ButtonBuilder()
          .setCustomId("confirm_create")
          .setLabel("Confirmer")
          .setStyle(Discord.ButtonStyle.Success),
        new Discord.ButtonBuilder()
          .setCustomId("cancel_create")
          .setLabel("Annuler")
          .setStyle(Discord.ButtonStyle.Danger)
			)

      const collector = message.channel.createMessageComponentCollector({ time: 15000 });

      message.editReply({embeds: [embed], components: [row]})

      collector.on('collect', async i => {

        if (i.customId === 'confirm_create') {
          await i.deferReply()
          const new_role = await message.guild.roles.create({
            name: args.get("nom").value+" ("+args.get("alias").value+")",
            color: args.get("couleur").value,
            hoist: false,
            permissions: BigInt(0),
            reason: "création d'un clan",
          })

          message.guild.members.cache.get(args.get("capitaine").value).roles.add(new_role)

          let logo = args.get("logo")? args.get("logo").value : null
          let date = args.get("date")? args.get("date").value : null
          let nat = args.get("nationalité")? args.get("nationalité").value : "🇺🇳"

          bot.db.run(`INSERT INTO clans (name, alias, role_id, captain_id, color, logo_url, foundation_date, nationality)
            VALUES ('${args.get("nom").value}', '${args.get("alias").value}', '${new_role.id}', '${args.get("capitaine").value}', '${args.get("couleur").value}', '${logo}', '${date}', '${nat}')`)

          return await i.editReply(`Le clan ${args.get("nom").value} a été ajouté.`)

        } else if (i.customId === 'cancel_create') {
          return await i.editReply("Commande annulée.")
        }
      })
    })
  }
}
