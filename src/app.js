require("dotenv").config();

const express = require("express");
const minimist = require("minimist");
const AwsService = require("./services/AwsService");
const StravaService = require("./services/StravaService");
const { killApp, handleError } = require("./utils/appErrorHandler");
const app = express();

const args = minimist(process.argv.slice(2));

const awsService = new AwsService();

const stravaToken = args.token || process.env.STRAVA_TOKEN;
const stravaClubId = args.clubId || process.env.STRAVA_CLUB_ID;

if (!stravaToken) {
  killApp({ exitCode: 9, consoleLog: "Missing --token param" });
}

if (!stravaClubId) {
  killApp({ exitCode: 9, consoleLog: "Missing --clubId param" });
}

const stravaService = new StravaService(stravaToken);
stravaService.clubId = stravaClubId;

app.get("/", (req, res) => {
  res.send(`Hi!`);
});

app.get("/club-activities", (req, res) => {
  stravaService
    .callGet(stravaService.getClubActivities())
    .then((stravaRes) => {
      console.log(stravaRes.data);
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
    .callGet(stravaService.getClubMembers())
    .then((stravaRes) => {
      console.log(stravaRes.data);
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
