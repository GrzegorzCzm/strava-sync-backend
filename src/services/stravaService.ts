import { Service, Inject } from 'typedi';
import { Logger } from 'winston';

@Service()
export default class StravaService {
  refreshToken = '';
  accessToken = '';
  clubId = '';
  tokenExpirationDate;
  constructor(@Inject('logger') private logger: Logger, @Inject('strava') private strava) {
    this.refreshToken = process.env.STRAVA_REFRESH_TOKEN; //TODO
    this.clubId = process.env.STRAVA_CLUB_ID; //TODO
  }

  getClubMembers(clubId = this.clubId) {
    return this.callGet(`clubs/${clubId}/members`);
  }

  getClubActivities(clubId = this.clubId) {
    return this.callGet(`clubs/${clubId}/activities?per_page=25`);
  }

  async callGet(path) {
    // const isTokenExpired = this.tokenExpirationDate > Date.now();
    // if (isTokenExpired) {
    // await this.refreshTokens();
    // }
    this.logger.info(`GET API call to ${path}`);
    return this.strava.get(path);
  }

  async callPost(path, params) {
    // const isTokenExpired = this.tokenExpirationDate < Date.now();
    // if (isTokenExpired) {
    // await this.refreshTokens();
    // }
    this.logger.info(`POST API call to ${path} with params ${JSON.stringify(params)}`);
    return this.strava.post(path, params);
  }

  // refreshTokens() {
  //   //TODO
  //   return axios
  //     .post(STRAVA_ACCESS_TOKENS, {
  //       client_id: process.env.STRAVA_CLIENT_ID,
  //       client_secret: process.env.STRAVA_CLIENT_SECRET,
  //       grant_type: 'refresh_token',
  //       refresh_token: this.refreshToken,
  //     })
  //     .then(response => {
  //       const { access_token, refresh_token, expires_at } = response.data;
  //       this.accessToken = access_token;
  //       this.refreshToken = refresh_token;
  //       this.tokenExpirationDate = new Date(expires_at);

  //       this.strava.defaults.headers.Authorization = `Bearer ${this.accessToken}`;
  //       return;
  //     })
  //     .catch(error => {
  //       this.logger.error(error);
  //       return;
  //     });
  // }
}
