import { readdir } from 'fs/promises'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export async function loadCommands(client, commandsPath = join(__dirname, '..', 'commands')) {
    const files = await readdir(dir, { withFileTypes: true })

    for (const file of files) {
        const fullPath = join(dir, file.name)

        if (file.isDirectory()) {
            await loadCommands(client, fullPath)
        } else if (file.isFile() && file.name.endsWith('.js')) {
            try {
                const command = (await import(fullPath)).default

                if (command?.data && typeof command.execute === 'function') {
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