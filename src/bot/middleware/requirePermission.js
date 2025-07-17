export default function requirePermission(...requiredPermissions) {
    return async (interaction, next) => {
        if (!interaction.inGuild()) {
            await interaction.reply({
                content: '❌ This command can only be used in a server.',
                ephemeral: true
            })
            return false
        }

        const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null)

        // Allow bot owner to bypass permission check
        if (process.env.BOT_OWNER && interaction.user.id === process.env.BOT_OWNER) {
            return typeof next === 'function' ? next() : true
        }

        if (!member) {
            await interaction.reply({
                content: '❌ Could not retrieve your member data. Please contact the bot developer.',
                ephemeral: true
            })
            return false
        }

        const missing = member.permissions.missing(requiredPermissions)

        if (missing.length > 0) {
            await interaction.reply({
                content: `❌ You are missing the following permission(s): ${missing.map(perm => `\`${perm}\``).join(', ')}`,
                ephemeral: true
            })
            return false
        }

        

        return typeof next === 'function' ? next() : true
    }
}