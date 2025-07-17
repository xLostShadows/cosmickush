import { Events } from 'discord.js'
import { getConfig } from '../utils/config.js'

export default {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        getConfig(interaction.guildId)
        if (!interaction.isChatInputCommand()) return

        const command = client.commands.get(interaction.commandName)
        if (!command) {
            console.error(`! Unknown command: ${interaction.commandName}`)
            return interaction.reply({
                content: `Unknown command: ${interaction.commandName}. If you believe this is an error, please contact the bot developer.`,
                ephemeral: true
            })
        }

        try {
            if (command.middleware && Array.isArray(command.middleware)) {
                for (const middleware of command.middleware) {
                    const passed = await middleware(interaction, client)
                    if (!passed) return
                }
            }

            await command.execute(interaction, client, config)
        } catch (error) {
            console.error(`Error running command "${interaction.commandName}": ${error}`)

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({
                    content: 'There was an error executing this command.',
                    ephemeral: true
                })
            } else {
                await interaction.reply({
                    content: 'There was an error executing this command.',
                    ephemeral: true
                })
            }
        }
    }
}