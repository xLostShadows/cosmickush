import { SlashCommandBuilder } from 'discord.js'
import { getConfig, setConfig } from '../../utils/config.js'

export default {
    data: new SlashCommandBuilder()
        .setName('config')
        .setDescription('Get or set server configuration')
        .addSubcommand(sub =>
            sub.setName('get')
                .setDescription('Get a configuration value')
                .addStringOption(opt =>
                    opt.setName('key')
                        .setDescription('Configuration key')
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub.setName('set')
                .setDescription('Set a configuration value')
                .addStringOption(opt =>
                    opt.setName('key')
                        .setDescription('Configuration key')
                        .setRequired(true)
                )
                .addStringOption(opt =>
                    opt.setName('value')
                        .setDescription('Value to set')
                        .setRequired(true)
                )
        ),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand()
        const key = interaction.options.getString('key')
        const guildId = interaction.guildId

        if (sub === 'get') {
            try {
                const config = await getConfig(guildId)
                if (!(key in config)) {
                    return interaction.reply({ content: `❌ Key \`${key}\` not found in config.`, ephemeral: true })
                }
                return interaction.reply({ content: `\`${key}\` = \`${config[key]}\``, ephemeral: true })
            } catch (error) {
                console.log(error)
            }
        }

        if (sub === 'set') {
            try {
                const value = interaction.options.getString('value')
                // Try to parse value as boolean/number if possible
                let parsedValue = value
                if (value === 'true') parsedValue = true
                else if (value === 'false') parsedValue = false
                else if (!isNaN(Number(value))) parsedValue = Number(value)

                const updated = await setConfig(guildId, { [key]: parsedValue })
                return interaction.reply({ content: `✅ Set \`${key}\` to \`${parsedValue}\`.`, ephemeral: true })
            } catch (error) {
                console.log(error)
            }
        }
    }
}