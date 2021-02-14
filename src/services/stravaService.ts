import { Service, Inject } from 'typedi';
import { Logger } from 'winston';

@Service()
export default class StravaService {
  clubId = '';
  constructor(@Inject('logger') private logger: Logger, @Inject('strava') private strava: any) {
    this.clubId = process.env.STRAVA_CLUB_ID; //TODO
  }

  private validateTokens = async () => {
    const isTokenExpired = this.strava.tokenExpirationDate > Date.now();
    if (isTokenExpired) {
      const newTokensData = await this.strava.getNewTokens(this.strava.refreshToken);
      this.strava.tokensData = newTokensData;
      this.strava.axios.defaults.headers.Authorization = `Bearer ${newTokensData.accessToken}`;
    }
  };

  getClubMembers(clubId = this.clubId) {
    return this.callGet(`clubs/${clubId}/members`);
  }

  getClubActivities(clubId = this.clubId) {
    return this.callGet(`clubs/${clubId}/activities?per_page=25`);
  }

  async callGet(path) {
    await this.validateTokens();
    this.logger.info(`GET API call to ${path}`);
    return this.strava.axios.get(path);
  }

  async callPost(path, params) {
    await this.validateTokens();
    this.logger.info(`POST API call to ${path} with params ${JSON.stringify(params)}`);
    return this.strava.axios.post(path, params);
  }
}
