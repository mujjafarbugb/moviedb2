const redis = require('redis');

const redisClient = redis.createClient(process.env.REDIS_URL);

redisClient.on('error', (error) => {
  console.error('Redis error:', error);
});

module.exports = redisClient;