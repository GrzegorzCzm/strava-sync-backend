const stravaActivityFields = {
  ATHLETE: "athlete",
  ATHLETE_FIELDS: { FIRST_NAME: "firstname", LAST_NAME: "lastname" },
  NAME: "name",
  DISTANCE: "distance",
  MOVING_TIME: "moving_time",
  ELAPSED_TIME: "elapsed_time",
  TOTAL_ELEVATION_GAIN: "total_elevation_gain",
  TYPE: "type",
};

const parsedActivityFields = {
  ID: "id",
  NAME: "name",
  ATHLETE: "athlete",
  TYPE: "type",
  DISTANCE: "distance",
  MOVING_TIME: "movingTime",
  DATE: "date",
};

const activityTypes = {
  RIDE: "Ride",
  RUN: "Run",
  WALK: "Walk",
  VIRTUAL_RIDE: "VirtualRide",
};

exports.activityTypes = activityTypes;
exports.stravaActivityFields = stravaActivityFields;
exports.parsedActivityFields = parsedActivityFields;
