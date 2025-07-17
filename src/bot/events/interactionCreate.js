import { Events } from 'discord.js'

export default {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        if (!interaction.isChatInputCommand()) return
        if (!interaction.isCommand()) return
        
        const command = client.commands.get(interaction.commandName)
        if (!command) return
        
        if (Array.isArray(command.middleware)) {
            for (const mw of command.middleware) {
                const passed = await mw(interaction)
                if (!passed) return
            }
        }
        
        await command.execute(interaction)

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

            await command.execute(interaction, client)
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