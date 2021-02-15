import {
  StravaData,
  StravaTokensData,
  StravaClubMembersData,
  StravaClubActivitiesData,
} from '../interfaces/IStrava';

declare global {
  namespace Models {
    export type Strava = StravaData;
    export type StravaTokens = StravaTokensData;
    export type StravaClubMembers = StravaClubMembersData;
    export type StravaClubActivities = StravaClubActivitiesData;
  }
}
