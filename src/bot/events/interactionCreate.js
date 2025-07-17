import { Events } from 'discord.js'

export default {
    name: Events.InteractionCreate,
    once: false,
    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return

        const command = interaction.client.commands.get(interaction.commandName)
        if (!command) return

        // Run middleware (all must return true)
        if (Array.isArray(command.middleware)) {
            for (const mw of command.middleware) {
                const passed = await mw(interaction, () => true)
                if (!passed) return
            }
        }

        try {
            await command.execute(interaction)
        } catch (error) {
            console.error(`Error running command "${interaction.commandName}":`, error)

            try {
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
            } catch (err) {
                console.error('Failed to send error reply:', err)
            }
        }
    }
}