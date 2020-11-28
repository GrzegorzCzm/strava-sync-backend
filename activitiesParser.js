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
    date: new Date().toISOString().slice(0, 10),
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
//TO DO
// const filterActivitiesByDates({activities, startDate, endDate}) => {

// }

const filterActivities = ({ activities, filterField, filterValue }) => {
  if (typeof filterValue == "string") {
    return activities.filter(
      (activity) => activity[filterField] == filterValue
    );
  } else {
    return activities.filter((activity) =>
      activity[filterField].match(filterValue)
    );
  }
};

exports.parseActivities = parseActivities;
exports.getNewestActivities = getNewestActivities;
exports.accumulateActivities = accumulateActivities;
exports.filterActivities = filterActivities;
