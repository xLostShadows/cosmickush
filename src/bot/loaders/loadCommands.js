import { readdir } from 'fs/promises'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * Loads commands and attaches resolved middleware functions.
 * @param {Client} client - The Discord client.
 * @param {Map} middlewareMap - Map of middleware factories, keyed by name.
 * @param {string} commandsPath - Path to commands directory.
 */
export async function loadCommands(client, middlewareMap, commandsPath = join(__dirname, '..', 'commands')) {
    const files = await readdir(commandsPath, { withFileTypes: true })

    for (const file of files) {
        const fullPath = join(commandsPath, file.name)

        if (file.isDirectory()) {
            await loadCommands(client, middlewareMap, fullPath)
        } else if (file.isFile() && file.name.endsWith('.js')) {
            try {
                const command = (await import(fullPath)).default

                if (command?.data && typeof command.execute === 'function') {
                    // Attach resolved middleware if specified
                    if (Array.isArray(command.middleware)) {
                        command.middleware = command.middleware.map(mw => {
                            if (typeof mw === 'function') return mw
                            if (typeof mw === 'string' && middlewareMap.has(mw)) return middlewareMap.get(mw)
                            if (Array.isArray(mw) && middlewareMap.has(mw[0])) {
                                return middlewareMap.get(mw[0])(...mw.slice(1))
                            }
                            return null
                        }).filter(Boolean)
                    }
                    client.commands.set(command.data.name, command)
                } else {
                    console.warn(`Skipped invalid command file: ${file.name}. Missing .data or .execute`)
                }
            } catch (error) {
                console.error(`Failed loading ${file.name}: ${error}`)
            }
        }
    }
}