import { Events } from 'discord.js'
import { getConfig } from '../utils/config.js'

export default {
    name: Events.GuildMemberAdd,
    once: false,
    async execute(member) {
        const { guild } = member
        const config = await getConfig(guild.id)
        if (!config) return

        const welcomeToggle = config.WELCOMETOGGLE

        if (welcomeToggle){
            const welcomeMsg = config.WELCOMEMSG
            if (config.WELCOMECHANNELID) {
                const welcomeChannel = guild.channels.cache.get(config.WELCOMECHANNELID)
                if (welcomeChannel?.isTextBased()) {
                    welcomeChannel.send({
                        embeds: [
                            {
                                color: 0x57f287,
                                title: 'Member Joined',
                                description: welcomeMsg,
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
        }
        
        const memberLogEnabled = config.MEMBERLOGENABLED

        if (memberLogEnabled) {
            const modLogChannel = config.MODLOGCHANNEL
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
                                text: `User ID: ${member.id} | © Cosmic Kush Discord Bot`
                            },
                            timestamp: new Date().toISOString()
                        }
                    ]
                })
            }
        }

        if (config.WELCOMEDM) {
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
