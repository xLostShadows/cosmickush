import {
    SlashCommandBuilder,
    EmbedBuilder
} from 'discord.js'
import { getConfig } from '../../utils/config.js'

export default {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a user from the server')
        .addStringOption(option =>
            option.setName('user')
                .setDescription('The @user mention or ID of the user you wish to kick')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the kick')
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

            if (!member) {
                return interaction.editReply('❌ That user is not in this server.')
            }

            if (!member.kickable) {
                return interaction.editReply('❌ I can\'t kick this user. Perhaps they have higher permissions.')
            }

            try {
                await member.kick(reason)
            } catch (error) {
                console.error(error)
                return interaction.editReply('❌ Failed to kick the user. Please contact the bot developer.')
            }

            const logChannelId = config.MOD_LOG_CHANNEL || config.LOG_CHANNEL_ID
            const logChannel = logChannelId
                ? interaction.guild.channels.cache.get(logChannelId)
                : null

            if (logChannel && logChannel.isTextBased()) {
                const embed = new EmbedBuilder()
                    .setTitle('👢 Member Kicked')
                    .setColor(0xffa500)
                    .addFields(
                        { name: 'User', value: `${user.tag} (${user.id})`, inline: false },
                        { name: 'By', value: `${interaction.user.tag} (${interaction.user.id})`, inline: false },
                        { name: 'Reason', value: reason, inline: false }
                    )
                    .setTimestamp()

                await logChannel.send({ embeds: [embed] }).catch(console.error)
            }

            return interaction.editReply(`✅ ${user.tag} (${user.id}) has been kicked.\n📝 Reason: ${reason}`)
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