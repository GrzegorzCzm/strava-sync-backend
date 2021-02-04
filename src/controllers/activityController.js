const {
  activityTypes,
  stravaActivityFields,
  parsedActivityFields,
} = require("../../src/models/ActivityModel");

const parseStravaActivities = (stravaActivities) => {
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  const currentTimestamp = currentDate.getTime();
  return stravaActivities.map((workout) => ({
    [parsedActivityFields.ID]: generateId(workout),
    [parsedActivityFields.NAME]: workout[stravaActivityFields.NAME],
    [parsedActivityFields.ATHLETE]: `${
      workout[stravaActivityFields.ATHLETE][
        stravaActivityFields.ATHLETE_FIELDS.FIRST_NAME
      ]
    }_${
      workout[stravaActivityFields.ATHLETE][
        stravaActivityFields.ATHLETE_FIELDS.LAST_NAME
      ]
    }`.replace(/\s|\.|-/g, ""),
    [parsedActivityFields.TYPE]: workout[stravaActivityFields.TYPE],
    [parsedActivityFields.DISTANCE]: workout[stravaActivityFields.DISTANCE],
    [parsedActivityFields.MOVING_TIME]:
      workout[stravaActivityFields.MOVING_TIME],
    [parsedActivityFields.DATE]: currentTimestamp,
  }));
};

const generateId = (workout) =>
  `id-${workout[stravaActivityFields.DISTANCE]}-${
    workout[stravaActivityFields.MOVING_TIME]
  }`;

const getIdsArray = (activities) =>
  activities.map((activity) => activity[parsedActivityFields.ID]);

const getNewestActivities = ({ oldActivities, newActivities }) => {
  const oldIds = getIdsArray(oldActivities);
  const newestActivities = newActivities.filter(
    (newActivity) => !oldIds.includes(newActivity[parsedActivityFields.ID])
  );
  return newestActivities;
};

const accumulateActivities = ({ activities, keyField, accumulateFields }) => {
  const accumulationSet = {};

  activities.forEach((activity) => {
    const keyFieldValue = activity[keyField];
    if (keyFieldValue in accumulationSet) {
      accumulateFields.forEach((accField) => {
        accumulationSet[keyFieldValue][accField] += activity[accField];
      });
    } else {
      accumulationSet[keyFieldValue] = {};
      accumulateFields.forEach((accField) => {
        accumulationSet[keyFieldValue][accField] = activity[accField];
      });
    }
  });
  return accumulationSet;
};

const stringDateToUnix = (stringDate) => {
  const splitedStringDate = stringDate.split("-");
  return new Date(
    splitedStringDate[0],
    splitedStringDate[1] - 1,
    splitedStringDate[2]
  ).getTime();
};

const filterActivitiesByDates = ({ activities, startDate, endDate }) => {
  const unixStartDate = stringDateToUnix(startDate);
  const unixEndDate = stringDateToUnix(endDate);
  return activities.filter((activity) => {
    return (
      unixStartDate <= activity[parsedActivityFields.DATE] &&
      activity[parsedActivityFields.DATE] <= unixEndDate
    );
  });
};

const filterActivities = ({ activities, filterField, filterValues }) => {
  return activities.filter((activity) =>
    filterValues.includes(activity[filterField])
  );
};

const parseDynamodDbActivities = (dynamoDbActivities) => {
  const parsedActivities = dynamoDbActivities.map((ddbActivity) => {
    const activity = {};
    for (const [key, value] of Object.entries(ddbActivity)) {
      activity[key] = value.S || Number(value.N);
    }
    return activity;
  });
  return parsedActivities;
};

exports.parseStravaActivities = parseStravaActivities;
exports.parseDynamodDbActivities = parseDynamodDbActivities;
exports.getNewestActivities = getNewestActivities;
exports.accumulateActivities = accumulateActivities;
exports.filterActivities = filterActivities;
exports.stringDateToUnix = stringDateToUnix;
exports.filterActivitiesByDates = filterActivitiesByDates;
