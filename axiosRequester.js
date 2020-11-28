const axios = require("axios");

class AxiosRequester {
  constructor(barerToken) {
    this.axiosInstance = axios.create({
      baseURL: "https://www.strava.com/api/v3/",
      timeout: 10000,
      headers: { Authorization: "Bearer " + barerToken },
    });
  }

  callGet(path) {
    return this.axiosInstance.get(path);
  }
}

module.exports = AxiosRequester;
