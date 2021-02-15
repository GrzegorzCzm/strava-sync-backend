import { Service, Inject } from 'typedi';
import { Logger } from 'winston';
import { AxiosResponse } from 'axios';

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
    const isTokenExpired = this.strava.tokensData.tokenExpirationDate > Date.now();
    if (isTokenExpired) {
      const newTokensData = await this.strava.getNewTokens(this.strava.tokensData.refreshToken);
      this.strava.tokensData = newTokensData;
      this.strava.axios.defaults.headers.Authorization = `Bearer ${newTokensData.accessToken}`;
    }
  };

  getClubMembers(clubId = this.clubId): Promise<AxiosResponse<Models.StravaClubMembers>> {
    return this.callGet(`clubs/${clubId}/members`);
  }

  getClubActivities(clubId = this.clubId): Promise<AxiosResponse<Models.StravaClubActivities>> {
    return this.callGet(`clubs/${clubId}/activities?per_page=25`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async callGet(path: string): Promise<AxiosResponse<any>> {
    await this.validateTokens();
    this.logger.info(`GET API call to ${path}`);
    return this.strava.axios.get(path);
  }

  async callPost(path: string, params: unknown): Promise<AxiosResponse<unknown>> {
    await this.validateTokens();
    this.logger.info(`POST API call to ${path} with params ${JSON.stringify(params)}`);
    return this.strava.axios.post(path, params);
  }
}
