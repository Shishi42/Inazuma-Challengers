const slashcommands_loader = require("../loaders/slashcommands_loader")
const Sequelize = require("sequelize")

module.exports = async bot => {

  await slashcommands_loader(bot)

  bot.db = new Sequelize({
    dialect: 'sqlite',
    storage: './challengers.db'
  })

  bot.Clans = bot.db.define('clan', {
    clan_id: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    alias: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    role_id: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    color: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    logo_url: {
      type: Sequelize.STRING,
      defaultValue: null,
    },
    found_date: {
      type: Sequelize.STRING,
      defaultValue: null,
    },
    nationality: {
      type: Sequelize.STRING,
      defaultValue: "🇺🇳"
    },
    captain_id: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    }
  })

  bot.Members = bot.db.define('member', {
    member_id: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    clan_id: Sequelize.STRING,
    is_captain: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
    }
  })

  bot.Clans.sync()
  bot.Members.sync()
  console.log(`Database online`)

  console.log(`Connecté en tant que ${bot.user.tag}!`)

  let statuses = [
    "Inazuma Eleven",
    "Inazuma Eleven 2",
    "Inazuma Eleven 3",
    "Inazuma Eleven GO",
    "Inazuma Eleven GO Chrono Stones",
    "Inazuma Eleven GO Galaxy",
    "Inazuma Eleven Strikers",
    "Inazuma Eleven Strikers 2012 Xtreme",
    "Inazuma Eleven GO Strikers 2013",
    "Inazuma Eleven GO Strikers 2013 Xtreme",
    "Inazuma Eleven SD 💀",
    "Inazuma Eleven Eiyū-tachi no Victory Road",

    "Inazuma Eleven Anime",
    "Inazuma Eleven GO Anime",
    "Inazuma Eleven the Movie: The Invasion of the Strongest Army Ogre",
    "Inazuma Eleven GO the Movie: The Ultimate Bonds Gryphon",
    "Inazuma Eleven GO VS Danball Senki W, the Movie",

    "Inazuma Eleven - Original Soundtrack",
    "Inazuma Eleven - Nekketsu Soundtrack vol.1",
    "Inazuma Eleven - Nekketsu Soundtrack vol.2",
    "Inazuma Eleven - Nekketsu Soundtrack vol.3",
    "Inazuma Eleven The Invasion of the Strongest Army Ogre - Original Soundtrack",
    "Inazuma Eleven GO - Nekketsu Soundtrack",
    "Inazuma Eleven GO Chrono Stones - Jikuu Saikyou Soundtrack Best Selection",
    "Inazuma Eleven GO Galaxy - Original Soundtrack",
    "Inazuma Eleven GO VS Danball Senki W - Original Soundtrack",
    "Inazuma Eleven: Ares no Tenbin & Orion no Kokuin - Original Soundtrack"
  ]

  setInterval(function(){
    let status = statuses[Math.floor(Math.random() * statuses.length)]
    let type = 0 // playing
    if(status.includes("Anime") || status.includes("Movie")) type = 3 // watching
    if(status.includes("Soundtrack")) type = 2 // listening
    bot.user.setPresence({activities: [{ name: status, type: type }], status: 'online'})

  }, Math.floor(Math.random() * 600000))
}
