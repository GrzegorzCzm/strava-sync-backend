import { Service, Inject } from 'typedi';
import { Logger } from 'winston';
import { AxiosInstance } from 'axios';
import config from '../config';

@Service()
export default class StravaService {
  clubId = '';
  constructor(
    @Inject('logger') private logger: Logger,
    @Inject('strava') private stravaConnection: AxiosInstance,
    @Inject('redis') private redis: Models.Redis,
  ) {
    this.clubId = process.env.STRAVA_CLUB_ID;
  }

  updateAccessTokens = async (): Promise<void> => {
    let refreshToken;
    try {
      refreshToken = await this.redis.getAsync('stravaRefreshToken');
    } catch (error) {
      this.logger.error(
        '!!! Error has happened while fetching strava refresh token from DB. Default token will be taken. ' +
          error?.message,
      );
    }
    refreshToken = refreshToken ?? process.env.STRAVA_REFRESH_TOKEN;

    try {
      const result = await this.stravaConnection.post(config.urls.STRAVA_TOKENS_URL, {
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      });
      const { access_token, refresh_token, expires_at } = result.data;
      const unfiedTokenExpirationDate = new Date(expires_at * 1000);
      this.logger.info(`Strava access token new exporation date: ` + unfiedTokenExpirationDate);
      await this.redis.setAsync('stravaAccessTokenExpirationDate', unfiedTokenExpirationDate);
      await this.redis.setAsync('stravaRefreshToken', refresh_token);
      this.stravaConnection.defaults.headers.Authorization = `Bearer ${access_token}`;
      return;
    } catch (error) {
      this.logger.error('!!! Error has happend while refreshing strava tokens: ' + error?.message);
    }
  };

  private validateTokens = async () => {
    const currentTime = Date.now();

    let stravaAccessTokenExpirationDate;
    try {
      stravaAccessTokenExpirationDate = await this.redis.getAsync(
        'stravaAccessTokenExpirationDate',
      );
    } catch (error) {
      console.log('Error while getting, exp data', stravaAccessTokenExpirationDate);
    }

    this.logger.info(
      `Strava token validation - currentTime: ${new Date(
        currentTime,
      )}, access token exp. time: ${new Date(stravaAccessTokenExpirationDate)}`,
    );
    const isTokenExpired =
      !stravaAccessTokenExpirationDate || stravaAccessTokenExpirationDate < currentTime;
    if (isTokenExpired) {
      await this.updateAccessTokens();
    }
  };

  getClubMembers(clubId = this.clubId): Promise<unknown> {
    return this.callGet(`clubs/${clubId}/members`);
  }

  getClubActivities(clubId = this.clubId): Promise<unknown> {
    return this.callGet(`clubs/${clubId}/activities?per_page=25`);
  }

  async callGet(path: string): Promise<unknown> {
    await this.validateTokens();
    this.logger.info(`GET API call to ${path}`);
    try {
      const results = await this.stravaConnection.get(path);
      return results.data;
    } catch (error) {
      this.logger.error('!!! Error has happend: ' + error?.message);
      return [];
    }
  }

  async callPost(path: string, params: unknown): Promise<unknown> {
    await this.validateTokens();
    this.logger.info(`POST API call to ${path} with params ${JSON.stringify(params)}`);
    try {
      const results = await this.stravaConnection.post(path, params);
      return results;
    } catch (error) {
      this.logger.error('!!! Error has happend: ' + error?.message);
      return;
    }
  }
}
