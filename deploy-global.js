// src/scripts/deploy-global-commands.js
import { REST, Routes } from 'discord.js'
import { config } from 'dotenv'
import { readdir, stat } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const commands = []
const commandsPath = path.join(__dirname, './src/bot/commands')

async function loadCommands(dir) {
  const files = await readdir(dir)

  for (const file of files) {
    const fullPath = path.join(dir, file)
    const statObj = await stat(fullPath)

    if (statObj.isDirectory()) {
      await loadCommands(fullPath)
    } else if (file.endsWith('.js')) {
      const command = (await import(fullPath)).default
      if (command?.data && command?.execute) {
        commands.push(command.data.toJSON())
      }
    }
  }
}

async function deploy() {
  await loadCommands(commandsPath)

  const rest = new REST().setToken(process.env.TOKEN)

  try {
    console.log(`📤 Deploying ${commands.length} commands...`)

    let route
    if (process.env.GUILD_ID) {
      route = Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, process.env.GUILD_ID)
      console.log(`Deploying to guild: ${process.env.GUILD_ID}`)
    } else {
      route = Routes.applicationCommands(process.env.DISCORD_CLIENT_ID)
      console.log('Deploying globally')
    }

    await rest.put(route, { body: commands })

    console.log('✅ Successfully deployed commands.')
  } catch (error) {
    console.error('❌ Error deploying commands:', error)
  }
}

deploy()
