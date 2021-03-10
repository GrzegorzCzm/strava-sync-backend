import { Inject, Container, Service } from 'typedi';
import { Logger } from 'winston';

import { ParsedActivityQuery } from '../interfaces/IRoutes';
import { DynamoDbClubActivityData } from '../interfaces/IDynamoDb';
import {
  StravaClubActivityData,
  ProccessedActivity,
  StravaClubMemberData,
} from '../interfaces/IStrava';
import config from '../config';

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

  async getClubMembers(): Promise<string[]> {
    const stravaRes = await this.stravaServiceInstance.getClubMembers();
    return this.parseMembers(stravaRes.data as StravaClubMemberData[]);
  }

  async getClubActivities(query: unknown): Promise<ProccessedActivity[]> {
    const parsedActivitiesQuery = this.parseActivitiesUrlQuery(query);
    const dynamoDbRes = await this.dynamoDbServiceInstance.getDynamoDbTableScan(
      config.dynamoDB.ACTIVITIES_TABLE_NAME,
      parsedActivitiesQuery,
    );
    return this.parseDynamodDbActivities(dynamoDbRes.Items);
  }

  async syncActivities(): Promise<void> {
    const stravaActivities = await this.stravaServiceInstance.getClubActivities();
    this.logger.info(`Got ${stravaActivities.length} activities from Strava`);
    const parsedStravaNewActivities = this.parseStravaActivities(stravaActivities);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const currentTimestamp = currentDate.getTime();

    const currentDateMinusYear = new Date();
    currentDateMinusYear.setFullYear(currentDateMinusYear.getFullYear() - 1);
    currentDateMinusYear.setHours(0, 0, 0, 0);
    const currentTimestampsMinusYear = currentDateMinusYear.getTime();

    const dynamoDbActivities = await this.dynamoDbServiceInstance.getActivitiesFromDateRange(
      config.dynamoDB.ACTIVITIES_TABLE_NAME,
      currentTimestampsMinusYear,
      currentTimestamp,
    );

    const parsedDynamoDBActiviteis = this.parseDynamodDbActivities(dynamoDbActivities.Items);
    const diffActivities = this.getNewestActivities(
      parsedDynamoDBActiviteis,
      parsedStravaNewActivities,
    );
    if (diffActivities.length) {
      this.logger.info(
        `Newest ${diffActivities.length} activities to upload. Activities: ${JSON.stringify(
          diffActivities.map(activity => activity.name),
        )}`,
      );
      const uploadResult = await this.dynamoDbServiceInstance.putDynamoDbBatchItems(
        config.dynamoDB.ACTIVITIES_TABLE_NAME,
        diffActivities,
      );
      this.logger.info('Upload result' + JSON.stringify(uploadResult));
    } else {
      this.logger.info(`No new activities to upload.`);
    }
  }

  private parseActivitiesUrlQuery(query: unknown): ParsedActivityQuery {
    console.log('query', query);
    const parsedQuery: ParsedActivityQuery = {
      date: { from: undefined, to: undefined },
      movingTime: { from: undefined, to: undefined },
      distance: { from: undefined, to: undefined },
      athlete: [],
      name: [],
      type: [],
    };

    for (const [key, val] of Object.entries(query)) {
      switch (key) {
        case 'dateFrom':
          parsedQuery.date.from = this.getTimestamp(val);
          break;
        case 'dateTo':
          parsedQuery.date.to = this.getTimestamp(val);
          break;
        case 'movingFrom':
          parsedQuery.movingTime.from = this.getNumber(val);
          break;
        case 'movingTo':
          parsedQuery.movingTime.to = this.getNumber(val);
          break;
        case 'distanceFrom':
          parsedQuery.distance.from = this.getNumber(val);
          break;
        case 'distanceTo':
          parsedQuery.distance.to = this.getNumber(val);
          break;
        case 'athlete':
          parsedQuery.athlete = val;
          break;
        case 'name':
          parsedQuery.name = val;
          break;
        case 'type':
          parsedQuery.type = val;
      }
    }

    if (parsedQuery.date.from && !parsedQuery.date.to) parsedQuery.date.to = Date.now();
    if (!parsedQuery.date.from && parsedQuery.date.to) parsedQuery.date.from = 0;

    if (typeof parsedQuery.movingTime.to === 'number' && parsedQuery.movingTime.from === undefined)
      parsedQuery.movingTime.from = 0;
    if (parsedQuery.movingTime.to === undefined && typeof parsedQuery.movingTime.from === 'number')
      parsedQuery.movingTime.to = 999999999;

    if (typeof parsedQuery.distance.to === 'number' && parsedQuery.distance.from === undefined)
      parsedQuery.distance.from = 0;
    if (parsedQuery.distance.to === undefined && typeof parsedQuery.distance.from === 'number')
      parsedQuery.distance.to = 999999999;

    console.log('parsedQuery', parsedQuery);
    return parsedQuery;
  }

  private getTimestamp(value: string): number | undefined {
    const timestamp = Date.parse(value);
    return isNaN(timestamp) ? undefined : timestamp;
  }
  private getNumber(value: string): number | undefined {
    const parsedNumber = Number(value);
    return isNaN(parsedNumber) ? undefined : parsedNumber;
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const activity: any = {};
      for (const [key, value] of Object.entries(ddbActivity)) {
        activity[key] = value.S || Number(value.N);
      }
      return activity;
    });
    return parsedActivities;
  }
}
