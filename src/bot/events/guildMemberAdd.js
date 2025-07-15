import { Events } from 'discord.js'
import getConfig from '../utils/config.js'

export default {
    name: Events.GuildMemberAdd,
    once: false,
    async execute(member) {
        const { guild } = member
        const config = await getConfig(guild.id)
        if (!config) return

        const welcomeMsg = process.env.WELCOMEMESSAGE

        if (config.welcomeChannelId) {
            const welcomeChannel = guild.channels.cache.get(config.welcomeChannelId)
            if (modLogChannel?.isTextBased()) {
                modLogChannel.send({
                    embeds: [
                        {
                            color: 0x57f287,
                            title: 'Member Joined',
                            description: `<@${member.id}> (${member.user.tag}) has joined the server.`,
                            thumbnail: {
                                url: member.user.displayAvatarURL({ dynamic: true })
                            },
                            footer: {
                                text: `User ID: ${member.id}`
                            },
                            timestamp: new Date().toISOString(),
                        },
                    ],
                })
            }
        }

        if (config.welcomeDm) {
            try {
                await member.send({
                    content: welcomeMsg.replace(`<@${member.id}>`, member.user.username)
                })
            } catch (err) {
                console.warn(`Failed to DM welcome message to ${member.user.tag}:`, err.message)
            }
        }
    }
}