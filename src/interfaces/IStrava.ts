export interface StravaTokensData {
  accessToken: string;
  refreshToken: string;
  tokenExpirationDate: number;
}

export interface StravaClubMemberData {
  firstname: string;
  lastname: string;
}

export type StravaClubMembersData = StravaClubMemberData[];

export type ActivityType = 'Ride' | 'Run' | 'Walk' | 'VirtualRide';

export interface StravaClubActivityData {
  athlete: StravaClubMemberData;
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  type: ActivityType;
}

export type StravaClubActivitiesData = StravaClubActivityData[];

export interface ProccessedActivity {
  id: string;
  name: string;
  athlete: string;
  type: ActivityType;
  distance: number;
  movingTime: number;
  date: number;
}

export interface SummedActivities {
  [sumKeyField: string]: { [accumulationField: string]: number };
}
