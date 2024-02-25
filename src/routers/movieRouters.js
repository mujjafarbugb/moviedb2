const express = require('express');
const axios = require('axios');
const redisClient = require('../config/redisConfig');// ../redisConfig

const router = express.Router();
const cacheMiddleware = (req, res, next) => {
  const { id } = req.params;

  // Check if the Redis client is connected
  if (redisClient.connect) {
    // Proceed with the cache middleware logic
    redisClient.get(id, (err, data) => {
      if (err) {
        console.error('Redis error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        // If data is found in the cache, send it as a response
        if (data) {
          res.json(JSON.parse(data));
        } else {
          // If data is not in the cache, proceed with the route handler
          next();
        }
      }
    });
  } else {
    // Handle the case when the Redis client is closed
    console.error('Redis client is closed.');
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
// Text search routes
// router.get('/popularity', async (req, res) => {
//   try {
//     const { keyword } = req.query;
//     const response = await axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${process.env.MOVIEDB_API_KEY}&query=${keyword}&sort_by=popularity.desc`);
//     const movies = response.data.results.map(({ id, title, poster_path }) => ({ id, title, poster_path }));
//     res.json(movies);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });
router.get(`/popularity`, async (req, res) => {
  try {
    const { keyword } = req.query;
    const response = await axios.get(`https://api.themoviedb.org/3/movie/popular`, {
      params: {
        api_key: process.env.MOVIEDB_API_KEY || "333a3dd3a3ddfde27635fd4e0cc4b487",
        query: keyword,
        sort_by: `popularity.desc` // Use the provided sortType
      }
    });
    const movies = response.data.results.map(({ id, title, poster_path }) => ({
      id,
      title,
      poster_path: poster_path ? `https://image.tmdb.org/t/p/w500${poster_path}` : null
    }));

    res.json(movies);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});





// router.get('/release-date', async (req, res) => {
//   try {
//     const { keyword } = req.query;
//     const response = await axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${process.env.MOVIEDB_API_KEY}&query=${keyword}&sort_by=release_date.desc`);
//     const movies = response.data.results.map(({ id, title, poster_path }) => ({ id, title, poster_path }));
//     res.json(movies);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

router.get('/release-date/:movieId', async (req, res) => {
  const { movieId } = req.params; // Correctly extracting movieId from req.params
  try {
    const { keyword } = req.query;
    const response = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}/release_dates`, {
      params: {
        api_key: process.env.MOVIEDB_API_KEY || "333a3dd3a3ddfde27635fd4e0cc4b487",
      }
    });

    const releaseDates = response.data.results;

    // You may need to process releaseDates according to your requirements
    // For example, you can directly send the releaseDates as JSON in the response
    res.json(releaseDates);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.get('/vote', async (req, res) => {
  try {
    const { keyword } = req.query;
    const response = await axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${process.env.MOVIEDB_API_KEY}&query=${keyword}&sort_by=vote_average.desc`);
    const movies = response.data.results.map(({ id, title, poster_path }) => ({ id, title, poster_path }));
    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Movie details route
router.get('/id/:id', cacheMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(`https://api.themoviedb.org/3/movie/${id}`, {
      params: {
        api_key: process.env.MOVIEDB_API_KEY || "333a3dd3a3ddfde27635fd4e0cc4b487",
      }
    });

    // Check if the response is successful (status code 2xx)
    if (response.status >= 200 && response.status < 300) {
      // Check if the response has data and has the expected structure
      if (response.data && response.data.someExpectedProperty) {
        // Set the value in the cache only if the request is successful
        redisClient.setex(id, 3600, JSON.stringify(response.data));
      }
      res.json(response.data);
    } else {
      // Handle API error
      console.error('API Error:', response.status, response.statusText);
      res.status(response.status).json({ error: 'API Error' });
    }
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});


// Metadata route
router.get('/metadata', async (req, res) => {
  try {
    // You can fetch metadata from MovieDB or use predefined values
    const metadata = {
      baseUrl: 'https://image.tmdb.org/t/p/',
      availableSizes: ['w92', 'w154', 'w185', 'w342', 'w500', 'w780', 'original']
    };

    res.json(metadata);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;