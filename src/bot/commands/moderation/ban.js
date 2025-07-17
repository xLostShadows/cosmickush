import {
    SlashCommandBuilder,
    EmbedBuilder
} from 'discord.js'
import { getConfig } from '../../utils/config.js'

export default {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a user from the server')
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
    middleware: [ ['requireRole', 'ADMIN_ROLE_ID'], ['requirePermission', 'BanMembers'] ],

    async execute(interaction) {
        try {
            const config = await getConfig(interaction.guildId)
            const input = interaction.options.getString('user')
            const reason = interaction.options.getString('reason')

            await interaction.deferReply({ ephemeral: true })

            let user
            try {
                user = await interaction.client.users.fetch(input.replace(/[<@!>]/g, ''))
            } catch {
                return interaction.editReply('❌ Invalid user ID or mention.')
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

            const logChannelId = config.MOD_LOG_CHANNEL || config.LOG_CHANNEL_ID
            const logChannel = logChannelId
                ? interaction.guild.channels.cache.get(logChannelId)
                : null

            if (logChannel && logChannel.isTextBased()) {
                const embed = new EmbedBuilder()
                    .setTitle('🔨 Member Banned')
                    .setColor(0xff0000)
                    .addFields(
                        { 
                            name: 'User',
                            value: `${user.tag} (${user.id})`,
                            inline: false
                        },
                        {
                            name: 'By',
                            value: `${interaction.user.tag} (${interaction.user.id})`,
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
        } catch (error) {
            console.error(error)
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({
                    content: '❌ An error occurred while executing this command.',
                    ephemeral: true
                })
            } else {
                await interaction.reply({
                    content: '❌ An error occurred while executing this command.',
                    ephemeral: true
                })
            }
        }
    }
}