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
    return this.parseMembers(stravaRes as StravaClubMemberData[]);
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
    const parsedQuery: ParsedActivityQuery = {
      date: { type: 'N', data: { from: undefined, to: undefined } },
      movingTime: { type: 'N', data: { from: undefined, to: undefined } },
      distance: { type: 'N', data: { from: undefined, to: undefined } },
      athlete: { type: 'S', data: [] },
      name: { type: 'S', data: [] },
      type: { type: 'S', data: [] },
    };

    for (const [key, val] of Object.entries(query)) {
      switch (key) {
        case 'dateFrom':
          parsedQuery.date.data.from = this.getTimestamp(val);
          break;
        case 'dateTo':
          parsedQuery.date.data.to = this.getTimestamp(val);
          break;
        case 'movingFrom':
          parsedQuery.movingTime.data.from = this.getNumber(val);
          break;
        case 'movingTo':
          parsedQuery.movingTime.data.to = this.getNumber(val);
          break;
        case 'distanceFrom':
          parsedQuery.distance.data.from = this.getNumber(val);
          break;
        case 'distanceTo':
          parsedQuery.distance.data.to = this.getNumber(val);
          break;
        case 'athlete':
          parsedQuery.athlete.data = val;
          break;
        case 'name':
          parsedQuery.name.data = val;
          break;
        case 'type':
          parsedQuery.type.data = val;
      }
    }

    if (parsedQuery.date.data.from && !parsedQuery.date.data.to)
      parsedQuery.date.data.to = `${Date.now()}`;
    if (!parsedQuery.date.data.from && parsedQuery.date.data.to) parsedQuery.date.data.from = '0';

    if (
      typeof parsedQuery.movingTime.data.to === 'number' &&
      parsedQuery.movingTime.data.from === undefined
    )
      parsedQuery.movingTime.data.from = '0';
    if (
      parsedQuery.movingTime.data.to === undefined &&
      typeof parsedQuery.movingTime.data.from === 'number'
    )
      parsedQuery.movingTime.data.to = '999999999';

    if (
      typeof parsedQuery.distance.data.to === 'number' &&
      parsedQuery.distance.data.from === undefined
    )
      parsedQuery.distance.data.from = '0';
    if (
      parsedQuery.distance.data.to === undefined &&
      typeof parsedQuery.distance.data.from === 'number'
    )
      parsedQuery.distance.data.to = '999999999';

    return parsedQuery;
  }

  private getTimestamp(value: string): string | undefined {
    const timestamp = Date.parse(value);
    return isNaN(timestamp) ? undefined : `${timestamp}`;
  }
  private getNumber(value: string): string | undefined {
    const parsedNumber = Number(value);
    return isNaN(parsedNumber) ? undefined : `${parsedNumber}`;
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
