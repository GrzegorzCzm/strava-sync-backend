require("dotenv").config();

const express = require("express");
const minimist = require("minimist");
const AwsService = require("./services/AwsService");
const StravaService = require("./services/StravaService");
const { killApp, handleError } = require("./utils/appErrorHandler");
const app = express();

const args = minimist(process.argv.slice(2));

const logToConsole = (text) => console.log(text);

const awsService = new AwsService();

const stravaRefreshToken =
  args.refreshToken || process.env.STRAVA_REFRESH_TOKEN;
const stravaClubId = args.clubId || process.env.STRAVA_CLUB_ID;

if (!stravaRefreshToken) {
  killApp({ exitCode: 9, consoleLog: "Missing --refreshToken param" });
}

if (!stravaClubId) {
  killApp({ exitCode: 9, consoleLog: "Missing --clubId param" });
}

const stravaService = new StravaService(stravaRefreshToken, logToConsole);
stravaService.clubId = stravaClubId;
stravaService.refreshTokens();

app.get("/", (req, res) => {
  res.send(`Hi!`);
});

app.get("/club-activities", (req, res) => {
  stravaService
    .getClubActivities()
    .then((stravaRes) => {
      res.send(stravaRes.data);
    })
    .catch((error) => {
      handleError({
        responseStatus: error.response.status,
        message: error.message,
        response: res,
      });
    });
});

app.get("/club-members", (req, res) => {
  stravaService
    .getClubMembers()
    .then((stravaRes) => {
      res.send(stravaRes.data);
    })
    .catch((error) => {
      handleError({
        responseStatus: error.response.status,
        message: error.message,
        response: res,
      });
    });
});

const server = app.listen(3000, () => {
  console.log("Server ready");
});

process.on("SIGTERM", () => {
  server.close(() => {
    console.log("Process terminated");
  });
});
