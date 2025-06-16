export default function hasRole(id) {
    return async (interaction, next) => {
        if (!interaction.inGuild()) {
            return interaction.reply({
                content: '❌ This command can only be used in a server.',
                ephemeral: true
            })
        }

        const member = await interaction.guild.members.fetch(interaction.user.id)
        const memberRole = member.roles.cache.some(role => role.id === id)

        if (!hasRole) {
            return interaction.reply({
                content: `❌ You must have the **${memberRole.name}** role to use this command.`,
                ephemeral: true
            })
        }

        return next()
    }
}