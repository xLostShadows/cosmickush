import { PermissionsBitField } from 'discord.js'

export function hasPermissions(...requiredPermissions) {
    return async (interaction, next) => {
        if (!interaction.inGuild) {
            return interaction.reply({
                content: '❌ This command can only be used in a server.',
                ephemeral: true
            })
        }

        const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null)

        if (!member) {
            return interaction.reply({
                content: '❌ Could not retrieve your member data. Please contact the bot developer.',
                ephemeral: true
            })
        }

        const missing = member.permissions.missing(requiredPermissions)

        if (missing.length > 0) {
            return interaction.reply({
                content: `❌ You are missing the following permission(s): ${missing.map(perm => `\`${perm}\``).join(', ')}`,
                ephemeral: true
            })
        }

        return next()
    }
}