import { readdir } from 'fs/promises'
import { dirname, join, parse } from 'path'
import { fileURLToPath } from 'url'
import { getConfig } from '../utils/config.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * Loads all middleware functions from the middleware directory.
 * Returns a Map where the key is the middleware filename (without extension)
 * and the value is a function that injects guild config as the first argument.
 */
export async function loadMiddleware(middlewarePath = join(__dirname, '..', 'middleware')) {
    const middlewareMap = new Map()
    const files = await readdir(middlewarePath, { withFileTypes: true })

    for (const file of files) {
        if (file.isFile() && file.name.endsWith('.js')) {
            const fullPath = join(middlewarePath, file.name)
            try {
                const mod = await import(fullPath)
                const key = parse(file.name).name
                // Wrap middleware so it always receives guild config as first argument
                const original = mod.default || mod
                // Factory: (...args) => async (interaction, ...rest) => { ... }
                middlewareMap.set(key, (...args) => {
                    const middlewareFn = original(...args)
                    return async (interaction, ...rest) => {
                        const guildId = interaction.guildId
                        const config = guildId ? await getConfig(guildId) : {}
                        return middlewareFn(config, interaction, ...rest)
                    }
                })
            } catch (error) {
                console.error(`Failed loading middleware ${file.name}: ${error}`)
            }
        }
    }
    return middlewareMap
}