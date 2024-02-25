// Example: redisConfig.js
const redis = require('redis');
const { URL } = require('url');

const redisClient = () => {
  const redisUrlString = process.env.REDIS_URL || "redis://red-cn5cdh7109ks739th93g:6379";
  const redisUrl = new URL(redisUrlString);

  const redisClient = redis.createClient({
    host: redisUrl.hostname,
    port: redisUrl.port,
    password: redisUrl.password
  });

  redisClient.on('error', (error) => {
    console.error('Redis error:', error);
  });
console.log(redisClient)
  return redisClient;
};

module.exports = redisClient;
