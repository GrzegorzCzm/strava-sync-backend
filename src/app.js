require("dotenv").config();

const express = require("express");
const minimist = require("minimist");
const AwsService = require("./services/AwsService");
const StravaService = require("./services/StravaService");
const { killApp, handleError } = require("./utils/appErrorHandler");
const { createNewLogger } = require("./utils/logger");
const app = express();

const args = minimist(process.argv.slice(2));

const awsService = new AwsService();

const logger = createNewLogger();

const stravaRefreshToken =
  args.refreshToken || process.env.STRAVA_REFRESH_TOKEN;
const stravaClubId = args.clubId || process.env.STRAVA_CLUB_ID;

if (!stravaRefreshToken) {
  logger.error("Missing --refreshToken param");
  killApp({ exitCode: 9 });
}

if (!stravaClubId) {
  logger.error("Missing --clubId param");
  killApp({ exitCode: 9 });
}

const stravaService = new StravaService(stravaRefreshToken, logger);
stravaService.clubId = stravaClubId;
stravaService.refreshTokens();

// setInterval(() => {
//   stravaService
//     .getClubActivities()
//     .then((stravaResult) => {
//       logger.info(
//         ` got ${stravaResult.data.length} activities ` +
//           JSON.stringify(stravaResult.data)
//       );
//     })
//     .catch((error) => console.error(error));
// }, 5000);

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
      logger.error(error.message);
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
      logger.error(error.message);
      handleError({
        responseStatus: error.response.status,
        message: error.message,
        response: res,
      });
    });
});

const server = app.listen(3000, () => {
  logger.info("Server ready");
});

process.on("SIGTERM", () => {
  server.close(() => {
    logger.info("Process terminated");
  });
});
