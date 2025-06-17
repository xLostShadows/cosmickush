import { Client, GatewayIntentBits, Partials, Collection, Guild } from 'discord.js'

export const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildModeration
    ],
    partials: [Partials.Channel, Partials.GuildMember, Partials.Message, Partials.Reaction, Partials.ThreadMember, Partials.User]
})

client.commands = new Collection()
client.events = new Collection()
client.cooldowns = new Collection()