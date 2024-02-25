const axios = require('axios');
const redisClient = require('../redisService');

// Text search routes
exports.searchByPopularity = async (req, res) => {
  try {
    const { keyword } = req.query;
    const response = await axios.get(`https://api.themoviedb.org/3/search/movie`, {
      params: {
        api_key: process.env.MOVIEDB_API_KEY,
        query: keyword,
        sort_by: 'popularity.desc'
      }
    });
    const movies = response.data.results.map(({ id, title, poster_path }) => ({ id, title, poster_path }));
    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.searchByReleaseDate = async (req, res) => {
  try {
    const { keyword } = req.query;
    const response = await axios.get(`https://api.themoviedb.org/3/search/movie`, {
      params: {
        api_key: process.env.MOVIEDB_API_KEY,
        query: keyword,
        sort_by: 'release_date.desc'
      }
    });
    const movies = response.data.results.map(({ id, title, poster_path }) => ({ id, title, poster_path }));
    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.searchByVote = async (req, res) => {
  try {
    const { keyword } = req.query;
    const response = await axios.get(`https://api.themoviedb.org/3/search/movie`, {
      params: {
        api_key: process.env.MOVIEDB_API_KEY,
        query: keyword,
        sort_by: 'vote_average.desc'
      }
    });
    const movies = response.data.results.map(({ id, title, poster_path }) => ({ id, title, poster_path }));
    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Movie details route
exports.getMovieById = async (req, res) => {
  try {
    const { id } = req.params;
    redisClient.get(id, async (err, data) => {
      if (err) throw err;

      if (data !== null) {
        res.json(JSON.parse(data));
      } else {
        const response = await axios.get(`https://api.themoviedb.org/3/movie/${id}`, {
          params: {
            api_key: process.env.MOVIEDB_API_KEY
          }
        });
        redisClient.setex(id, 3600, JSON.stringify(response.data));
        res.json(response.data);
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Metadata route
exports.getMetadata = (req, res) => {
  const metadata = {
    meta: {
      images: {
        baseUrl: 'https://image.tmdb.org/t/p/',
        sizes: ['w92', 'w154', 'w185', 'w342', 'w500', 'w780']
      }
    }
  };
  res.json(metadata);
};