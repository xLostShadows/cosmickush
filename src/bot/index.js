import 'dotenv/config'
import { client } from './client.js'

client.login(process.env.TOKEN)