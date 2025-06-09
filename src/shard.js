import { ShardingManager } from 'discord.js'
import 'dotenv/config'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const manager = new ShardingManager(join(__dirname, './bot/index.js'), {
    token: process.env.TOKEN
})

manager.on('shardCreate', shard =>
    console.log(`Launched shard ${shard.id}`)
)

manager.spawn()