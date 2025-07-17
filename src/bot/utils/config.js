import redis from '../clients/redis.js'

const defaultConfig = {
    LOG_CHANNEL_ID: null,
    ALLOW_DM_COMMANDS: false,
    WELCOMEMSG: null,
    MEMBERLOGENABLED: false,
    WELCOMETOGGLE: false,
    LEAVETOGGLE: false,
    LEAVEMSG: null,
    WELCOMECHANNELID: null,
    MOD_ROLE_ID: null
}

const keyFor = guildId => `config:guild:${guildId}`

export async function getConfig(guildId) {
    const raw = await redis.get(keyFor(guildId))

    if (!raw) {
        await setConfig(guildId, defaultConfig)
        return { ...defaultConfig }
    }

    try {
        const parsed = JSON.parse(raw)
        return { ...defaultConfig, ...parsed }
    } catch (err) {
        console.error(`❌ Failed to parse config for ${guildId}: ${err}`)
        return { ...defaultConfig }
    }
}

export async function setConfig(guildId, newPartialConfig) {
    const existing = await getConfig(guildId)
    const updated = { ...existing, ...newPartialConfig }

    try {
        await redis.set(keyFor(guildId), JSON.stringify(updated))
        return updated
    } catch (err) {
        console.error(`❌ Failed to set config for ${guildId}: ${err}`)
        return existing
    }
}

export async function deleteConfig(guildId) {
    return redis.del(keyFor(guildId))
}
