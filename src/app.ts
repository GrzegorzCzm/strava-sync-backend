import 'reflect-metadata';
import express from 'express';
import dotenv from 'dotenv';
import minimist from 'minimist';

import Logger from './loaders/logger';

dotenv.config();

const PORT = 3000; // TODO move this to config;

// const AwsService = require('./services/AwsService');
// const StravaService = require('./services/StravaService');
// const {
//   parseStravaActivities,
//   parseDynamodDbActivities,
//   getNewestActivities,
// } = require('./controllers/activityController');
// const { killApp, handleError } = require('./utils/appErrorHandler');

async function startServer() {
  const app = express();

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  await require('./loaders').default({ expressApp: app });

  app.get('/', (req, res) => {
    res.send(`Hi!`);
  });

  app
    .listen(PORT, () => {
      Logger.info(`Server listening on port: ${PORT}`);
    })
    .on('error', err => {
      Logger.error(err);
      process.exit(1);
    });
}

startServer();

// TO DO - refactor this
// const args = minimist(process.argv.slice(2));

// const awsService = new AwsService(Logger);

// const stravaRefreshToken = args.refreshToken || process.env.STRAVA_REFRESH_TOKEN;
// const stravaClubId = args.clubId || process.env.STRAVA_CLUB_ID;

// if (!stravaRefreshToken) {
//   Logger.error('Missing --refreshToken param');
//   killApp({ exitCode: 9 });
// }

// if (!stravaClubId) {
//   Logger.error('Missing --clubId param');
//   killApp({ exitCode: 9 });
// }

// const stravaService = new StravaService(stravaRefreshToken, Logger);
// stravaService.clubId = stravaClubId;
// stravaService.refreshTokens();

//MOVE NEWEST TO DYNAMODB
// setTimeout(() => {
//   stravaService
//     .getClubActivities()
//     .then(stravaResult => {
//       Logger.info(`Got ${stravaResult.data.length} activities from Strava`);
//       const parsedStravaNewActivities = parseStravaActivities(stravaResult.data);
//       const currentDate = new Date();
//       currentDate.setHours(0, 0, 0, 0);
//       const currentTimestamp = currentDate.getTime();

//       const currentDateMinusYear = new Date();
//       currentDateMinusYear.setFullYear(currentDateMinusYear.getFullYear() - 1);
//       currentDateMinusYear.setHours(0, 0, 0, 0);
//       const currentTimestampsMinusYear = currentDateMinusYear.getTime();

//       awsService.getActivitiesFromDateRange(
//         'stravaTestTwo',
//         `${currentTimestampsMinusYear}`,
//         `${currentTimestamp}`,
//         (err, data) => {
//           if (err) Logger.info(JSON.stringify(err) + JSON.stringify(err.stack));
//           else {
//             const parsedDynamoDBActiviteis = parseDynamodDbActivities(data.Items);
//             const diffActivities = getNewestActivities({
//               oldActivities: parsedDynamoDBActiviteis,
//               newActivities: parsedStravaNewActivities,
//             });
//             if (diffActivities.length) {
//               Logger.info(
//                 `Newset ${diffActivities.length} activities to upload. Activities: ${JSON.stringify(
//                   diffActivities.map(activity => activity.name),
//                 )}`,
//               );
//               awsService.putDynamoDbBatchItems('stravaTestTwo', diffActivities, (err, data) => {
//                 if (err) Logger.info(JSON.stringify(err) + JSON.stringify(err.stack));
//                 else {
//                   Logger.info(JSON.stringify(data));
//                 }
//               });
//             } else {
//               Logger.info(`No new activities to upload.`);
//             }
//           }
//         },
//       );
//     })
//     .catch(error => Logger.error(JSON.stringify(error)));
// }, 2000);

// app.get('/', (req, res) => {
//   res.send(`Hi!`);
// });

// app.get('/club-activities', (req, res) => {
//   stravaService
//     .getClubActivities()
//     .then(stravaRes => {
//       res.send(stravaRes.data);
//     })
//     .catch(error => {
//       Logger.error(error.message);
//       handleError({
//         responseStatus: error.response.status,
//         message: error.message,
//         response: res,
//       });
//     });
// });

// app.get('/club-members', (req, res) => {
//   stravaService
//     .getClubMembers()
//     .then(stravaRes => {
//       res.send(stravaRes.data);
//     })
//     .catch(error => {
//       Logger.error(error.message);
//       handleError({
//         responseStatus: error.response.status,
//         message: error.message,
//         response: res,
//       });
//     });
// });
