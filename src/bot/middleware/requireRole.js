import { getConfig } from '../utils/config.js'

export default function requireRole(roleKey) {
    return async (interaction, next) => {
        if (!interaction.inGuild()) {
            await interaction.reply({
                content: '❌ This command can only be used in a server.',
                ephemeral: true
            })
            return false
        }

        const guildId = interaction.guildId
        const config = await getConfig(guildId)
        const requiredRoleId = config[roleKey]

        if (!requiredRoleId) {
            await interaction.reply({ content: '❌ Required role not set in config.', ephemeral: true })
            return false
        }

        const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null)

        // Allow bot owner to bypass role check
        if (process.env.BOT_OWNER && interaction.user.id === process.env.BOT_OWNER) {
            return typeof next === 'function' ? next() : true
        }

        if (!member) {
            await interaction.reply({ content: '❌ Could not fetch your member data.', ephemeral: true })
            return false
        }

        

        if (!member.roles.cache.has(requiredRoleId)) {
            await interaction.reply({ content: '❌ You do not have the required role.', ephemeral: true })
            return false
        }

        return typeof next === 'function' ? next() : true
    }
}