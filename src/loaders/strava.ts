import axios from 'axios';
import logger from './logger';

import config from '../config';

const TIMEOUT = 10000;

export default async (): Promise<Models.Strava> => {
  const tokensData = await getRefreshedTokens(process.env.STRAVA_REFRESH_TOKEN);
  return {
    axios: axios.create({
      baseURL: config.urls.STRAVA_BASE_URL,
      timeout: TIMEOUT,
      headers: { Authorization: `Bearer ${tokensData.accessToken}` },
    }),
    tokensData: tokensData,
    getNewTokens: getNewTokens,
  };
};

const getNewTokens = async (refreshToken: string): Promise<Models.StravaTokens> => {
  return await getRefreshedTokens(refreshToken);
};

const getRefreshedTokens = async (refreshToken: string): Promise<Models.StravaTokens> => {
  try {
    const result = await axios.post(config.urls.STRAVA_TOKENS_URL, {
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });
    const { access_token, refresh_token, expires_at } = result.data;
    return {
      accessToken: access_token,
      refreshToken: refresh_token,
      tokenExpirationDate: new Date(expires_at).getTime(),
    };
  } catch (error) {
    logger.error(error?.message);
  }
};
