const axios = require("axios");

const STRAVA_BASE_URL = "https://www.strava.com/api/v3/";
const TIMEOUT = 10000;

class StravaService {
  clubId = "";
  constructor(barerToken) {
    this.axiosInstance = axios.create({
      baseURL: STRAVA_BASE_URL,
      timeout: TIMEOUT,
      headers: { Authorization: "Bearer " + barerToken },
    });
  }

  set clubId(value) {
    this.clubId = value;
  }

  getClubMembers(clubId = this.clubId) {
    return `clubs/${clubId}/members`;
  }
  getClubActivities(clubId = this.clubId) {
    return `clubs/${clubId}/activities`;
  }

  callGet(path) {
    return this.axiosInstance.get(path);
  }
}

module.exports = StravaService;
