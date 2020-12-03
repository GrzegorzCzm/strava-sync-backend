const {
  activityTypes,
  stravaActivityFields,
  parsedActivityFields,
} = require("../../src/models/ActivityModel");

const parseActivities = (stravaActivities) =>
  stravaActivities.map((workout) => ({
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
    [parsedActivityFields.DATE]: Date.now(),
  }));

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

exports.parseActivities = parseActivities;
exports.getNewestActivities = getNewestActivities;
exports.accumulateActivities = accumulateActivities;
exports.filterActivities = filterActivities;
exports.stringDateToUnix = stringDateToUnix;
exports.filterActivitiesByDates = filterActivitiesByDates;
