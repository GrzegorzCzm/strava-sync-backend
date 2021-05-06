const FIVE_MINUTES_IN_MS = 300000;

export default {
  server: {
    PORT: process.env.PORT ?? 8080,
    ACTIVITY_SYNC_DELAY_MS: FIVE_MINUTES_IN_MS,
  },
  urls: {
    STRAVA_BASE_URL: 'https://www.strava.com/api/v3/',
    STRAVA_TOKENS_URL: 'https://www.strava.com/oauth/token',
  },
  dynamoDB: {
    ACTIVITIES_TABLE_NAME: process.env.AWD_DYNAMODB_TABLE_NAME,
  },
};
