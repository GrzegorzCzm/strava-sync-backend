import { ActivityType } from './IStrava';

export interface DynamoDbClubActivityData {
  date: { N: string };
  id: { S: string };
  athlete: { S: string };
  distance: { N: string };
  movingTime: { N: string };
  name: { S: string };
  type: { S: ActivityType };
}

export interface FilterForDynamoDbTableScan {
  key: string;
  val: string;
  valType: 'S' | 'N';
}
