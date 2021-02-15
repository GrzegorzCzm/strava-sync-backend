import { AxiosInstance } from 'axios';

export interface StravaTokensData {
  accessToken: string;
  refreshToken: string;
  tokenExpirationDate: number;
}

export interface StravaData {
  axios: AxiosInstance;
  tokensData: StravaTokensData;
  getNewTokens: (refreshToken: string) => Promise<StravaTokensData>;
}

interface StravaClubMemberData {
  firstname: string;
  lastname: string;
}

export type StravaClubMembersData = StravaClubMemberData[];

interface StravaClubActivityData {
  athlete: StravaClubMemberData;
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  type: string;
}

export type StravaClubActivitiesData = StravaClubActivityData[];
