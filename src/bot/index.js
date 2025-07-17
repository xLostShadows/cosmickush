import 'dotenv/config'
import { client } from './client.js'
import { loadCommands } from './loaders/loadCommands.js'
import { loadEvents } from './loaders/loadEvents.js'
import { loadMiddleware } from './loaders/loadMiddleware.js'

const middleware = await loadMiddleware()

loadCommands(client, middleware)
loadEvents(client)

client.login(process.env.TOKEN)