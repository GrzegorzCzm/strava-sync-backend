import axios from 'axios';

const STRAVA_BASE_URL = 'https://www.strava.com/api/v3/';
const STRAVA_TOKENS_URL = 'https://www.strava.com/oauth/token';
const TIMEOUT = 10000;

export default async () => {
  const tokensData = await getRefreshedTokens(process.env.STRAVA_REFRESH_TOKEN);
  return {
    axios: axios.create({
      baseURL: STRAVA_BASE_URL,
      timeout: TIMEOUT,
      headers: { Authorization: `Bearer ${tokensData.accessToken}` },
    }),
    tokensData: tokensData,
    getNewTokens: getNewTokens,
  };
};

const getNewTokens = async (refreshToken: string) => {
  return await getRefreshedTokens(refreshToken);
};

const getRefreshedTokens = async (refreshToken: string) => {
  const result = await axios.post(STRAVA_TOKENS_URL, {
    client_id: process.env.STRAVA_CLIENT_ID,
    client_secret: process.env.STRAVA_CLIENT_SECRET,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });
  const { access_token, refresh_token, expires_at } = result.data;
  return {
    accessToken: access_token,
    refreshToken: refresh_token,
    tokenExpirationDate: new Date(expires_at),
  };
};
