require("dotenv").config();

const express = require("express");
const minimist = require("minimist");
const AwsService = require("./services/AwsService");
const StravaService = require("./services/StravaService");
const { killApp, handleError } = require("./utils/appErrorHandler");
const app = express();

const args = minimist(process.argv.slice(2));

const awsService = new AwsService();

if (!args.token) {
  killApp({ exitCode: 9, consoleLog: "Missing --token param" });
}

if (!args.clubId) {
  killApp({ exitCode: 9, consoleLog: "Missing --clubId param" });
}

const stravaService = new StravaService(args.token);
stravaService.clubId = args.clubId;

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
