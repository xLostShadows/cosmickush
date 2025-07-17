import { Events } from 'discord.js'
import getConfig from '../utils/config.js'

export default {
    name: Events.GuildMemberRemove,
    once: false,
    async execute(member) {
        const { guild } = member
        const config = await getConfig(guild.id)
        if (!config) return

        const welcomeEnabled = config.WELCOMETOGGLE
        const leaveMsg = config.LEAVEMESSAGE

        if (welcomeEnabled) {
            if (config.welcomeChannelId) {
                const welcomeChannel = guild.channels.cache.get(config.WELCOMECHANNELID)
                if (welcomeChannel?.isTextBased()) {
                    welcomeChannel.send({
                        embeds: [
                            {
                                color: 0x57f287,
                                title: 'Member Left',
                                description: leaveMsg,
                                thumbnail: {
                                    url: member.user.displayAvatarURL({ dynamic: true })
                                },
                                footer: {
                                    text: `User ID: ${member.id}`
                                },
                                timestamp: new Date().toISOString()
                            }
                        ]
                    })
                }
            }
        }

        const modLogChannel = config.LOG_CHANNEL_ID
        const memberLogEnabled = config.MEMBERLOGENABLED
        if (memberLogEnabled){
            if (modLogChannel?.isTextBased) {
                modLogChannel.send({
                    embeds: [
                        {
                            color: 0x57f287,
                            title: 'Member Left',
                            description: `<@${member.id}> (${member.user.tag}) has left the server.`,
                            thumbnail: {
                                url: member.user.displayAvatarURL({ dynamic: true })
                            },
                            footer: {
                                text: `User ID: ${member.id}`
                            },
                            timestamp: new Date().toIsoString()
                        }
                    ]
                })
            }
        }
    }
}
