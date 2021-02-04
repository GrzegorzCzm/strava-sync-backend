require("dotenv").config();

const express = require("express");
const minimist = require("minimist");
const AwsService = require("./services/AwsService");
const StravaService = require("./services/StravaService");
const {
  parseStravaActivities,
  parseDynamodDbActivities,
  getNewestActivities,
} = require("./controllers/activityController");
const { killApp, handleError } = require("./utils/appErrorHandler");
const { createNewLogger } = require("./utils/logger");
const app = express();

const args = minimist(process.argv.slice(2));
const logger = createNewLogger();

const awsService = new AwsService(logger);

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

//MOVE NEWEST TO DYNAMODB
setTimeout(() => {
  stravaService
    .getClubActivities()
    .then((stravaResult) => {
      logger.info(`Got ${stravaResult.data.length} activities from Strava`);
      const parsedStravaNewActivities = parseStravaActivities(
        stravaResult.data
      );
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      const currentTimestamp = currentDate.getTime();

      const currentDateMinusYear = new Date();
      currentDateMinusYear.setFullYear(currentDateMinusYear.getFullYear() - 1);
      currentDateMinusYear.setHours(0, 0, 0, 0);
      const currentTimestampsMinusYear = currentDateMinusYear.getTime();

      awsService.getActivitiesFromDateRange(
        "stravaTestTwo",
        `${currentTimestampsMinusYear}`,
        `${currentTimestamp}`,
        (err, data) => {
          if (err) logger.info(JSON.stringify(err) + JSON.stringify(err.stack));
          else {
            const parsedDynamoDBActiviteis = parseDynamodDbActivities(
              data.Items
            );
            const diffActivities = getNewestActivities({
              oldActivities: parsedDynamoDBActiviteis,
              newActivities: parsedStravaNewActivities,
            });
            if (diffActivities.length) {
              logger.info(
                `Newset ${
                  diffActivities.length
                } activities to upload. Activities: ${JSON.stringify(
                  diffActivities.map((activity) => activity.name)
                )}`
              );
              awsService.putDynamoDbBatchItems(
                "stravaTestTwo",
                diffActivities,
                (err, data) => {
                  if (err)
                    logger.info(
                      JSON.stringify(err) + JSON.stringify(err.stack)
                    );
                  else {
                    logger.info(JSON.stringify(data));
                  }
                }
              );
            } else {
              logger.info(`No new activities to upload.`);
            }
          }
        }
      );
    })
    .catch((error) => logger.error(JSON.stringify(error)));
}, 2000);

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
