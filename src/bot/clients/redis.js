import Redis from 'ioredis'

const redis = new Redis({
    host: process.env.HOST,
    port: process.env.PORT,
    username: process.env.USERNAME,
    password: process.env.PASSWORD
})

redis.on('connect', () => console.log('🔌 Redis connected'))
redis.on('error', err => console.error('❌ Redis error:', err))

export default redis