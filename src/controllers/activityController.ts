import { StravaClubActivityData, ProccessedActivity } from '../interfaces/IStrava';
import { DynamoDbClubActivityData } from '../interfaces/IDynamoDb';

export const parseStravaActivities = (
  stravaActivities: StravaClubActivityData[],
): ProccessedActivity[] => {
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  const currentTimestamp = currentDate.getTime();
  return stravaActivities.map(
    (workout: StravaClubActivityData): ProccessedActivity => ({
      id: generateId(workout),
      name: workout.name,
      athlete: `${workout.athlete.firstname}_${workout.athlete.lastname}`.replace(/\s|\.|-/g, ''),
      type: workout.type,
      distance: workout.distance,
      movingTime: workout.moving_time,
      date: currentTimestamp,
    }),
  );
};

const generateId = (workout: StravaClubActivityData) =>
  `id-${workout.distance}-${workout.moving_time}`;

const getIdsArray = (activities: ProccessedActivity[]): string[] =>
  activities.map((activity: ProccessedActivity) => activity.id);

export const getNewestActivities = (
  oldActivities: ProccessedActivity[],
  newActivities: ProccessedActivity[],
): ProccessedActivity[] => {
  const oldIds = getIdsArray(oldActivities);
  const newestActivities = newActivities.filter(newActivity => !oldIds.includes(newActivity.id));
  return newestActivities;
};

interface AccumulateActivities {
  activities: ProccessedActivity[];
  keyField: string;
  accumulateFields: string[];
}
export const accumulateActivities = ({
  activities,
  keyField,
  accumulateFields,
}: AccumulateActivities): { [fieldName: string]: number } => {
  const accumulationSet = {};

  activities.forEach(activity => {
    const keyFieldValue = activity[keyField];
    if (keyFieldValue in accumulationSet) {
      accumulateFields.forEach(accField => {
        accumulationSet[keyFieldValue][accField] += activity[accField];
      });
    } else {
      accumulationSet[keyFieldValue] = {};
      accumulateFields.forEach(accField => {
        accumulationSet[keyFieldValue][accField] = activity[accField];
      });
    }
  });
  return accumulationSet;
};

const stringDateToUnix = (stringDate: string): number => {
  const splitedStringDate = stringDate.split('-');
  return new Date(
    Number(splitedStringDate[0]),
    Number(splitedStringDate[1]) - 1,
    Number(splitedStringDate[2]),
  ).getTime();
};

interface FilterActivitiesByDates {
  activities: ProccessedActivity[];
  startDate: string;
  endDate: string;
}

export const filterActivitiesByDates = ({
  activities,
  startDate,
  endDate,
}: FilterActivitiesByDates): ProccessedActivity[] => {
  const unixStartDate = stringDateToUnix(startDate);
  const unixEndDate = stringDateToUnix(endDate);
  return activities.filter(activity => {
    return unixStartDate <= activity.date && activity.date <= unixEndDate;
  });
};

interface FilterActivities {
  activities: ProccessedActivity[];
  filterField: string;
  filterValues: (number | string)[];
}

export const filterActivities = ({
  activities,
  filterField,
  filterValues,
}: FilterActivities): ProccessedActivity[] => {
  return activities.filter(activity => filterValues.includes(activity[filterField]));
};

export const parseDynamodDbActivities = (dynamoDbActivities: DynamoDbClubActivityData[]): any[] => {
  const parsedActivities = dynamoDbActivities.map(ddbActivity => {
    const activity = {};
    for (const [key, value] of Object.entries(ddbActivity)) {
      activity[key] = value.S || Number(value.N);
    }
    return activity;
  });
  return parsedActivities;
};
