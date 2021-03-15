import {
  StravaTokensData,
  StravaClubMembersData,
  StravaClubActivitiesData,
} from '../interfaces/IStrava';
import { RedisConnection } from '../interfaces/IRedis';

declare global {
  namespace Models {
    export type StravaTokens = StravaTokensData;
    export type StravaClubMembers = StravaClubMembersData;
    export type StravaClubActivities = StravaClubActivitiesData;
    export type Redis = RedisConnection;
  }
}
