import 'reflect-metadata';
import { Inject, Container, Service } from 'typedi';
import chai, { expect } from 'chai';
import chaiMatchPattern from 'chai-match-pattern';
import { AxiosInstance } from 'axios';

import {
  stravaSingleRawActivity,
  stravaRawTestData_1,
  stravaRawTestData_2,
} from '../data/stravaRawData';
import { dynamoDbSingleRawActivity } from '../data/dynamoDbRawData';
import { singleParsedActivity, parsedTestData_1, parsedTestData_2 } from '../data/parsedData';

import {
  StravaTokensData,
  StravaClubMembersData,
  StravaClubActivitiesData,
} from '../../src/interfaces/IStrava';
import { RedisConnection } from '../../src/interfaces/IRedis';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Models {
    export type StravaTokens = StravaTokensData;
    export type StravaClubMembers = StravaClubMembersData;
    export type StravaClubActivities = StravaClubActivitiesData;
    export type Redis = RedisConnection;
  }
}

import ClubController from '../../src/controllers/clubController';
import StravaService from '../../src/services/stravaService';

chai.use(chaiMatchPattern);

describe('ClubController', () => {
  Container.set('logger', { info: data => console.log(data) });
  Container.set('redis', {
    getAsync: data => console.log('Redis GET', data),
    setAsync: (field, data) => console.log('Redis GET', field, data),
  });
  Container.set('strava', {
    get: (data: any) => console.log('GET', data),
    post: (data: any) => console.log('POST', data),
  } as AxiosInstance);
  Container.set('dynamoDb', { scan: async () => ({ Items: [dynamoDbSingleRawActivity] }) });

  const stravaServiceInstance = new StravaService(
    Container.get('logger'),
    Container.get('strava'),
    Container.get('redis'),
  );

  const clubControllerInstance = Container.get(ClubController);

  it('should parse activities', async () => {
    const expectedParsedResult = {
      athlete: 'Jan_S',
      date: /^[0-9]{13}$/g,
      distance: 2574.9,
      id: 'id-2574.9-2431',
      movingTime: 2431,
      name: 'Afternoon Walk',
      type: 'Walk',
    };

    const parsedActivities = await clubControllerInstance.getClubActivities({});
    expect(parsedActivities[0]).to.matchPattern(expectedParsedResult);
  });

  // it('should return only newest activities', () => {
  //   const expectedNewestActivty = {
  //     id: 'id-6230.6-1816',
  //     name: 'Let’s run',
  //     athlete: 'Grzegorz_C',
  //     type: activityTypes.RUN,
  //     distance: 6230.6,
  //     movingTime: 1816,
  //     date: 1606669334297,
  //   };

  //   const newestActivities = getNewestActivities({
  //     oldActivities: parsedTestData.parsedTestData_1,
  //     newActivities: parsedTestData.parsedTestData_2,
  //   });

  //   expect(newestActivities.length).to.equal(1);
  //   expect(newestActivities[0]).to.matchPattern(expectedNewestActivty);
  // });

  // it('should accumulate given fields', () => {
  //   const expectedAccumulationSet = {
  //     Grzegorz_C: { distance: 80283.1, movingTime: 13599 },
  //     Jan_S: { distance: 80699.3, movingTime: 14869 },
  //   };

  //   const accumulationSet = accumulateActivities({
  //     activities: parsedTestData.parsedTestData_1,
  //     keyField: 'athlete',
  //     accumulateFields: [parsedActivityFields.DISTANCE, parsedActivityFields.MOVING_TIME],
  //   });

  //   expect(accumulationSet).to.matchPattern(expectedAccumulationSet);
  // });

  // it('should filter activities', () => {
  //   const filteredActivities = filterActivities({
  //     activities: parsedTestData.parsedTestData_1,
  //     filterField: parsedActivityFields.TYPE,
  //     filterValues: [activityTypes.VIRTUAL_RIDE, activityTypes.RUN],
  //   });

  //   expect(filteredActivities.length).to.equal(6);
  // });

  // it('filter activities by dates range', () => {
  //   const filteredByDates = filterActivitiesByDates({
  //     activities: parsedTestData.parsedTestData_1,
  //     startDate: '2020-11-29',
  //     endDate: '2020-11-30',
  //   });

  //   expect(filteredByDates.length).to.equal(6);
  // });
});
