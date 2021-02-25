import { Service, Inject } from 'typedi';
import { Logger } from 'winston';
import {
  DynamoDB,
  DescribeTableOutput,
  ListTablesCommandOutput,
  ScanCommandOutput,
  QueryCommandOutput,
  GetItemCommandOutput,
  PutItemCommandOutput,
  BatchWriteItemCommandOutput,
} from '@aws-sdk/client-dynamodb';

interface ScanFilter {
  key: string;
  val: string;
  valType: 'S' | 'N';
}

interface KVP {
  key: string;
  val: string;
}

type ActivityType = 'Run' | 'Ride' | 'Walk' | 'VirtualRide';
interface ActivityItem {
  id: string;
  name: string;
  athlete: string;
  type: ActivityType;
  distance: number;
  movingTime: number;
  date: number;
}

const prepareItemParams = (item: ActivityItem) => {
  const params = {};

  for (const [key, value] of Object.entries(item)) {
    if (typeof value === 'number') {
      params[key] = {
        N: `${value}`,
      };
    } else {
      params[key] = {
        S: value,
      };
    }
  }
  return params;
};

const prepareFilterForScan = (filtersArray: ScanFilter[]) => {
  const filtersForScan = {
    ExpressionAttributeNames: {},
    ExpressionAttributeValues: {},
    FilterExpression: ``,
  };
  filtersArray.forEach((filter: ScanFilter, index) => {
    filtersForScan.ExpressionAttributeNames[`#key${index}`] = filter.key;
    filtersForScan.ExpressionAttributeValues[`:val${index}`] = { [filter.valType]: filter.val };
    filtersForScan.FilterExpression +=
      (filtersForScan.FilterExpression ? ' AND ' : '') + `#key${index} = :val${index}`;
  });
  return filtersForScan;
};

@Service()
export default class DynamoDbService {
  constructor(
    @Inject('logger') private logger: Logger,
    @Inject('dynamoDb') private dynamoDb: DynamoDB,
  ) {}

  async getDynamoDbTableList(): Promise<ListTablesCommandOutput> {
    return await this.dynamoDb.listTables({});
  }

  async getDynamoDbTableDescription(tableName: string): Promise<DescribeTableOutput> {
    const params = { TableName: tableName };

    return await this.dynamoDb.describeTable(params);
  }

  async getActivitiesFromDateRange(
    tableName: string,
    from: number,
    to: number,
  ): Promise<ScanCommandOutput> {
    const params = {
      ExpressionAttributeValues: {
        ':from': {
          N: `${from}`,
        },
        ':to': {
          N: `${to}`,
        },
      },
      FilterExpression: '#date between :from and :to',
      ExpressionAttributeNames: {
        '#date': 'date',
      },
      TableName: tableName,
    };

    return await this.dynamoDb.scan(params);
  }

  async getActivitiesFromGivenDay(tableName: string, date: number): Promise<QueryCommandOutput> {
    const params = {
      ExpressionAttributeValues: {
        ':date': {
          N: `${date}`,
        },
      },
      KeyConditionExpression: '#date = :date',
      ExpressionAttributeNames: {
        '#date': 'date',
      },
      TableName: tableName,
    };

    return await this.dynamoDb.query(params);
  }

  async getDynamoDbTableScan(
    tableName: string,
    filtersArray: ScanFilter[],
  ): Promise<QueryCommandOutput> {
    let params = {
      TableName: tableName,
    };
    if (filtersArray) {
      params = { ...params, ...prepareFilterForScan(filtersArray) };
    }

    return await this.dynamoDb.scan(params);
  }

  async getDynamoDbItem(tableName: string, keysAndVales: KVP[]): Promise<GetItemCommandOutput> {
    const params = { Key: {}, TableName: tableName };
    keysAndVales.forEach((kvp: KVP) => {
      params.Key[kvp.key] = { S: kvp.val };
    });

    return await this.dynamoDb.getItem(params);
  }

  async putDynamoDbItem(tableName: string, item: ActivityItem): Promise<PutItemCommandOutput> {
    const params = {
      Item: prepareItemParams(item),
      ReturnConsumedCapacity: 'TOTAL',
      TableName: tableName,
    };

    return await this.dynamoDb.putItem(params);
  }

  async putDynamoDbBatchItems(
    tableName: string,
    items: ActivityItem[],
  ): Promise<BatchWriteItemCommandOutput> {
    const parsedItemsToAdd = items.map((item: ActivityItem) => ({
      PutRequest: {
        Item: prepareItemParams(item),
      },
    }));

    const params = {
      RequestItems: {
        [tableName]: parsedItemsToAdd,
      },
    };
    return await this.dynamoDb.batchWriteItem(params);
  }
}
