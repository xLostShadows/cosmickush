import { ShardingManager } from 'discord.js'
import 'dotenv/config'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { stdin, stdout, stderr } from 'node:process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const manager = new ShardingManager(join(__dirname, './bot/index.js'), {
    token: process.env.TOKEN,
    totalShards: 'auto'
})

manager.on('shardCreate', shard => {
  console.log(`Launched shard ${shard.id}`)
  
  shard.on('message', message => {
    // Optional: receive custom messages from shards
    console.log(`Shard ${shard.id} message:`, message)
  })

  stdout.on('data', data => {
    stdout.write(`[Shard ${shard.id}] ${data}`)
  })

  stderr.on('data', data => {
    stderr.write(`[Shard ${shard.id} ERROR] ${data}`)
  })
})

manager.spawn()