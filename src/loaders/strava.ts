import axios from 'axios';

const STRAVA_BASE_URL = 'https://www.strava.com/api/v3/';
const STRAVA_ACCESS_TOKENS = 'https://www.strava.com/oauth/token';
const TIMEOUT = 10000;

export default () =>
  axios.create({
    baseURL: STRAVA_BASE_URL,
    timeout: TIMEOUT,
    headers: { Authorization: `Bearer ${process.env.STRAVA_ACCESS_TOKEN}` },
  });
