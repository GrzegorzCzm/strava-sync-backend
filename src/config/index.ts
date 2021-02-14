export default {
  server: {
    PORT: process.env.PORT ?? 3000,
  },
  urls: {
    STRAVA_BASE_URL: 'https://www.strava.com/api/v3/',
    STRAVA_TOKENS_URL: 'https://www.strava.com/oauth/token',
  },
};
