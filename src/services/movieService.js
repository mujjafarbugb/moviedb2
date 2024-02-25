const axios = require('axios');
const redisClient = require('./redisService');

const MOVIEDB_API_KEY = process.env.MOVIEDB_API_KEY;

const searchMoviesBy = async (keyword, sortBy) => {
  try {
    const response = await axios.get(`https://api.themoviedb.org/3/search/movie`, {
      params: {
        api_key: MOVIEDB_API_KEY,
        query: keyword,
        sort_by: sortBy
      }
    });
    return response.data.results.map(({ id, title, poster_path }) => ({ id, title, poster_path }));
  } catch (error) {
    throw new Error(`Failed to fetch movies: ${error.message}`);
  }
};

const getMovieById = async (id) => {
  try {
    return new Promise((resolve, reject) => {
      redisClient.get(id, async (err, data) => {
        if (err) reject(err);

        if (data !== null) {
          resolve(JSON.parse(data));
        } else {
          try {
            const response = await axios.get(`https://api.themoviedb.org/3/movie/${id}`, {
              params: {
                api_key: MOVIEDB_API_KEY
              }
            });
            redisClient.setex(id, 3600, JSON.stringify(response.data));
            resolve(response.data);
          } catch (error) {
            reject(new Error(`Failed to fetch movie details: ${error.message}`));
          }
        }
      });
    });
  } catch (error) {
    throw new Error(`Failed to fetch movie details: ${error.message}`);
  }
};

const getMetadata = () => {
  return {
    meta: {
      images: {
        baseUrl: 'https://image.tmdb.org/t/p/',
        sizes: ['w92', 'w154', 'w185', 'w342', 'w500', 'w780']
      }
    }
  };
};

module.exports = {
  searchMoviesBy,
  getMovieById,
  getMetadata
};