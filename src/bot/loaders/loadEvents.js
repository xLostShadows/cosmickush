import { readdir } from 'fs/promises'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export async function loadEvents(client, dir = join(__dirname, '..', 'events')) {
    const files = await readdir(dir, { withFileTypes: true })

    for (const file of files) {
        const fullPath = join(dir, file.name)

        if (file.isDirectory()) {
            await loadEvents(client, fullPath)
        } else if (file.isFile() && file.name.endsWith('.js')) {
            try {
                const event = (await import(fullPath)).default

                if (!event?.name || typeof event.execute !== 'function') {
                    console.warn(`Skipping invalid event file: ${file.name}. Missing .name or .execuute`)
                    continue
                }

                if (event.once) {
                    client.once(event.name, (...args) => event.execute(...args, client))
                } else {
                    client.on(event.name, (...args) => event.execute(...args, client))
                }
            } catch (error) {
                console.error(`Error loading command file ${file.name}: ${error}`)
            }
        }
    }
}