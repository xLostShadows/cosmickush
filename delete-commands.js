import { REST, Routes } from 'discord.js'
import { config } from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function deleteCommands() {
  const rest = new REST().setToken(process.env.TOKEN)

  try {
    let route
    if (process.env.GUILD_ID) {
      route = Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, process.env.GUILD_ID)
      console.log(`Deleting all commands from guild: ${process.env.GUILD_ID}`)
    } else {
      route = Routes.applicationCommands(process.env.DISCORD_CLIENT_ID)
      console.log('Deleting all global commands')
    }

    await rest.put(route, { body: [] })

    console.log('✅ Successfully deleted all commands.')
  } catch (error) {
    console.error('❌ Error deleting commands:', error)
  }
}

deleteCommands()