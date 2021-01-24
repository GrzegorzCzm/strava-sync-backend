const axios = require("axios");

const STRAVA_BASE_URL = "https://www.strava.com/api/v3/";
const STRAVA_ACCESS_TOKENS = "https://www.strava.com/oauth/token";
const TIMEOUT = 10000;

class StravaService {
  clubId = "";
  refreshToken = "";
  accessToken = "";
  constructor(stravaRefreshToken, logger) {
    this.logger = logger;
    this.refreshToken = stravaRefreshToken;
    this.axiosInstance = axios.create({
      baseURL: STRAVA_BASE_URL,
      timeout: TIMEOUT,
      headers: { Authorization: "Bearer " },
    });
  }

  set clubId(value) {
    this.clubId = value;
  }

  getClubMembers(clubId = this.clubId) {
    return callGet(`clubs/${clubId}/members`);
  }

  getClubActivities(clubId = this.clubId) {
    return this.callGet(`clubs/${clubId}/activities`);
  }

  async callGet(path) {
    const isTokenExpired = this.tokenExpirationDate > Date.now();
    if (isTokenExpired) {
      await this.refreshTokens();
    }
    return this.axiosInstance.get(path);
  }

  async callPost(path, params) {
    const isTokenExpired = this.tokenExpirationDate < Date.now();
    if (isTokenExpired) {
      await this.refreshTokens();
    }
    return this.axiosInstance.post(path, params);
  }

  refreshTokens() {
    return axios
      .post(STRAVA_ACCESS_TOKENS, {
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: this.refreshToken,
      })
      .then((response) => {
        const { access_token, refresh_token, expires_at } = response.data;
        this.accessToken = access_token;
        this.refreshToken = refresh_token;
        this.tokenExpirationDate = new Date(expires_at);

        this.axiosInstance.defaults.headers.Authorization = `Bearer ${this.accessToken}`;
        return;
      })
      .catch((error) => {
        this.logger.error(error);
        return;
      });
  }
}

module.exports = StravaService;
