import 'reflect-metadata';
import express from 'express';
import dotenv from 'dotenv';

import config from './config';
import Logger from './loaders/logger';

dotenv.config();

async function startServer() {
  const app = express();

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  await require('./loaders').default({ expressApp: app });

  app
    .listen(config.server.PORT, () => {
      Logger.info(`Server listening on port: ${config.server.PORT}`);
    })
    .on('error', err => {
      Logger.error(err);
      process.exit(1);
    });
}

startServer();

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
//         currentTimestampsMinusYear,
//         currentTimestamp,
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
