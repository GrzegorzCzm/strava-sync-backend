const parseActivities = (activities) =>
  activities.map((workout) => ({
    id: generateId(workout),
    name: workout.name,
    athlete: `${workout.athlete.firstname}_${workout.athlete.lastname}`.replace(
      /\s|\.|-/g,
      ""
    ),
    type: workout.type,
    distance: workout.distance,
    movingTime: workout.moving_time,
    date: Date.now(),
  }));

const generateId = (workout) => `id-${workout.distance}-${workout.moving_time}`;
const getIdsArray = (activities) => activities.map((activity) => activity.id);

const getNewestActivities = ({ oldActivities, newActivities }) => {
  const oldIds = getIdsArray(oldActivities);
  const newestActivities = newActivities.filter(
    (newActivity) => !oldIds.includes(newActivity.id)
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
    return unixStartDate <= activity.date && activity.date <= unixEndDate;
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
