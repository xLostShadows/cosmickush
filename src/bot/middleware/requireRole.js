import { getConfig } from '../utils/config.js'

export default function hasRole(roleKey) {
    return async (interaction, next) => {
        if (!interaction.inGuild()) {
            return interaction.reply({
                content: '❌ This command can only be used in a server.',
                ephemeral: true
            })
        }

        const guildId = interaction.guildId
        const config = await getConfig(guildId)
        const requiredRoleId = config[roleKey]
        if (!requiredRoleId) {
            await interaction.reply({ content: '❌ Required role not set in config.', ephemeral: true })
            return false
        }
        const member = interaction.member
        if (!member.roles.cache.has(requiredRoleId)) {
            await interaction.reply({ content: '❌ You do not have the required role.', ephemeral: true })
            return false
        }

        return next()
    }
}