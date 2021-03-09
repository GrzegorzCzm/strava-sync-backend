import { Service, Inject } from 'typedi';
import { Logger } from 'winston';

@Service()
export default class StravaService {
  clubId = '';
  constructor(
    @Inject('logger') private logger: Logger,
    @Inject('strava') private strava: Models.Strava,
  ) {
    this.clubId = process.env.STRAVA_CLUB_ID;
  }

  private validateTokens = async () => {
    const currentTime = Date.now();
    this.logger.info(
      `Strava token validation - currentTime: ${new Date(
        currentTime,
      )}, access token exp. time: ${new Date(this.strava.tokensData.tokenExpirationDate)}`,
    );
    const isTokenExpired = this.strava.tokensData.tokenExpirationDate < currentTime;
    if (isTokenExpired) {
      const newTokensData = await this.strava.getNewTokens(this.strava.tokensData.refreshToken);
      this.strava.tokensData = newTokensData;
      this.strava.axios.defaults.headers.Authorization = `Bearer ${newTokensData.accessToken}`;
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
      const results = await this.strava.axios.get(path);
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
      const results = await this.strava.axios.post(path, params);
      return results;
    } catch (error) {
      this.logger.error('!!! Error has happend: ' + error?.message);
      return;
    }
  }
}
