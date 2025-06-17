import {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder
} from 'discord.js'

export default {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a user from the server')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addStringOption(option =>
            option.setName('user')
                .setDescription('The @user mention or ID of the user you wish to ban')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the ban')
                .setRequired(true)
        ),

        async execute(interaction) {
            const input = interaction.options.getString('user')
            const reason = interaction.options.getStromg('reason')

            await interaction.deferReply({ ephemeral: true })

            let user
            try {
                user = await interaction.client.users.fetch(input.replace(/[<@!>]/g, ''))
            } catch {
                return interaction.reply('Invalid user ID or mention')
            }

            const member = await interaction.guild.members.fetch(user.id).catch(() => null)

            if (member && !member.bannable) {
                return interaction.editReply('❌ I cannot ban this user. They might have higher permissions.')
            }

            try {
                await interaction.guild.members.ban(user.id, { reason })
            } catch (err) {
                return interaction.editReply('❌ Failed to ban user. Do I have the `Ban Members` permission?')
            }

            const logChannel = interaction.guild.channels.cache.find(ch => ch.id === process.env.MOD_LOG_CHANNEL && ch.isTextBased())

            if (logChannel) {
                const embed = new EmbedBuilder()
                    .setName('🔨 Member Banned')
                    .setColor(0xff0000)
                    .addFields(
                        { 
                            name: 'User',
                            value: `${user.tag} (${user.id})`,
                            inline: false
                        },
                        {
                            name: 'By',
                            value: `${interaction.user.tag}`,
                            inline: false
                        },
                        {
                            name: 'Reason',
                            value: reason,
                            inline: false
                        }
                    )
                    .setTimestamp()
                
                await logChannel.send({ embeds: [embed] }).catch(console.error)
            }

            return interaction.editReply(`✅ ${user.tag} has been banned.\n📝 Reason: ${reason}`)
        }
}