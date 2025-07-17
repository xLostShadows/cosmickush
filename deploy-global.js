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
    console.log(`📤 Deploying ${commands.length} global commands...`)

    await rest.put(
      Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
      { body: commands }
    )

    console.log('✅ Successfully deployed global commands.')
  } catch (error) {
    console.error('❌ Error deploying commands:', error)
  }
}

deploy()
