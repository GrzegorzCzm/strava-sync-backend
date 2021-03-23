import { Inject, Container, Service } from 'typedi';
import chai, { expect } from 'chai';
import chaiMatchPattern from 'chai-match-pattern';
import { AxiosInstance } from 'axios';

import { singleRawActivity, rawTestData_1, rawTestData_2 } from '../data/rawData';
import { singleParsedActivity, parsedTestData_1, parsedTestData_2 } from '../data/parsedData';

import ClubController from '../../src/controllers/clubController';
import StravaService from '../../src/services/stravaService';

chai.use(chaiMatchPattern);

describe('ClubController', () => {
  const stravaServiceInsrance = new StravaService(
    Container.get('logger'),
    {
      get: (data: any) => console.log('GET', data),
      post: (data: any) => console.log('POST', data),
    } as AxiosInstance,
    Container.get('redis'),
  );

  const clubControllerInstance = Container.get(ClubController);

  it('should parse activities', () => {
    const expectedParsedResult = {
      athlete: 'Jan_S',
      date: /^[0-9]{13}$/g,
      distance: 3119.8,
      id: 'id-3119.8-2978',
      movingTime: 2978,
      name: 'Afternoon Walk',
      type: 'Walk',
    };

    const parsedActivities = clubControllerInstance.getClubActivities({});

    // expect(parsedActivities[0]).to.matchPattern(expectedParsedResult);
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
