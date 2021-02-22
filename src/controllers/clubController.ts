import { Inject, Container, Service } from 'typedi';

import { Logger } from 'winston';
import {
  StravaClubActivityData,
  ProccessedActivity,
  StravaClubMemberData,
} from '../interfaces/IStrava';
import { DynamoDbClubActivityData } from '../interfaces/IDynamoDb';

import StravaService from '../services/stravaService';
import DynamoDbService from '../services/dynamoDbService';

interface AccumulateActivities {
  activities: ProccessedActivity[];
  keyField: string;
  accumulateFields: string[];
}

interface FilterActivities {
  activities: ProccessedActivity[];
  filterField: string;
  filterValues: (number | string)[];
}
interface FilterActivitiesByDates {
  activities: ProccessedActivity[];
  startDate: string;
  endDate: string;
}

const generateId = (workout: StravaClubActivityData) =>
  `id-${workout.distance}-${workout.moving_time}`;

const getIdsArray = (activities: ProccessedActivity[]): string[] =>
  activities.map((activity: ProccessedActivity) => activity.id);

const stringDateToUnix = (stringDate: string): number => {
  const splitedStringDate = stringDate.split('-');
  return new Date(
    Number(splitedStringDate[0]),
    Number(splitedStringDate[1]) - 1,
    Number(splitedStringDate[2]),
  ).getTime();
};

const getAthleteIdentifier = (firstName: string, lastName: string) =>
  `${firstName}_${lastName}`.replace(/\s|\.|-/g, '');

@Service()
export default class ClubController {
  stravaServiceInstance;
  dynamoDbServiceInstance;
  constructor(@Inject('logger') private logger: Logger) {
    this.stravaServiceInstance = Container.get(StravaService);
    this.dynamoDbServiceInstance = Container.get(DynamoDbService);
  }

  async getClubMembers(): Promise<any> {
    const stravaRes = await this.stravaServiceInstance.getClubMembers();
    return this.parseMembers(stravaRes.data);
  }

  async getClubActivities(): Promise<any> {
    const stravaRes = await this.stravaServiceInstance.getClubActivities();
    return this.parseStravaActivities(stravaRes.data);
  }

  private parseMembers(stravaClubMembers: StravaClubMemberData[]): string[] {
    return stravaClubMembers.map((member: StravaClubMemberData) =>
      getAthleteIdentifier(member.firstname, member.lastname),
    );
  }

  private parseStravaActivities(stravaActivities: StravaClubActivityData[]): ProccessedActivity[] {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const currentTimestamp = currentDate.getTime();
    return stravaActivities.map(
      (workout: StravaClubActivityData): ProccessedActivity => ({
        id: generateId(workout),
        name: workout.name,
        athlete: getAthleteIdentifier(workout.athlete.firstname, workout.athlete.lastname),
        type: workout.type,
        distance: workout.distance,
        movingTime: workout.moving_time,
        date: currentTimestamp,
      }),
    );
  }

  private getNewestActivities(
    oldActivities: ProccessedActivity[],
    newActivities: ProccessedActivity[],
  ): ProccessedActivity[] {
    const oldIds = getIdsArray(oldActivities);
    const newestActivities = newActivities.filter(newActivity => !oldIds.includes(newActivity.id));
    return newestActivities;
  }

  private accumulateActivities({
    activities,
    keyField,
    accumulateFields,
  }: AccumulateActivities): { [fieldName: string]: number } {
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
  }

  private filterActivitiesByDates({
    activities,
    startDate,
    endDate,
  }: FilterActivitiesByDates): ProccessedActivity[] {
    const unixStartDate = stringDateToUnix(startDate);
    const unixEndDate = stringDateToUnix(endDate);
    return activities.filter(activity => {
      return unixStartDate <= activity.date && activity.date <= unixEndDate;
    });
  }

  private filterActivities({
    activities,
    filterField,
    filterValues,
  }: FilterActivities): ProccessedActivity[] {
    return activities.filter(activity => filterValues.includes(activity[filterField]));
  }

  private parseDynamodDbActivities(
    dynamoDbActivities: DynamoDbClubActivityData[],
  ): ProccessedActivity[] {
    const parsedActivities = dynamoDbActivities.map(ddbActivity => {
      const activity: any = {};
      for (const [key, value] of Object.entries(ddbActivity)) {
        activity[key] = value.S || Number(value.N);
      }
      return activity;
    });
    return parsedActivities;
  }
}
