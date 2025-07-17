import { readdir } from 'fs/promises'
import { dirname, join, parse } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * Loads all middleware factories from the middleware directory.
 * Returns a Map where the key is the middleware filename (without extension)
 * and the value is the middleware factory function.
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
                middlewareMap.set(key, mod.default || mod)
            } catch (error) {
                console.error(`Failed loading middleware ${file.name}: ${error}`)
            }
        }
    }
    return middlewareMap
}