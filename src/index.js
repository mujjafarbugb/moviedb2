const express = require('express');
const cors = require('cors');
const movieRoutes = require('./routers/movieRouters'); // Corrected path ./routes/movieRoutes

const app = express();

// Middleware
app.use(cors());
app.use(express.json());


// Handle server shutdown to quit Redis client gracefully
process.on('SIGINT', () => {
  console.log('Server is shutting down.');
  redisClient.quit(() => {
    console.log('Redis client is closed.');
    process.exit();
  });
});
// Routes
app.use('/api', movieRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});