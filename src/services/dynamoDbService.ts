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

import { ParsedQuery, Range } from '../interfaces/IRoutes';

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

const prepareFilterForScan = (parsedQuery: ParsedQuery) => {
  const filtersForScan = {
    ExpressionAttributeNames: {},
    ExpressionAttributeValues: {},
    FilterExpression: ``,
  };
  let isAnyFilterAdded = false;

  for (const [key, val] of Object.entries(parsedQuery)) {
    if (Array.isArray(val.data) && val.data.length) {
      filtersForScan.ExpressionAttributeNames[`#key_${key}`] = key;
      const valuesMappedConditions: string[] = [];
      val.data.forEach((value: string | number, index) => {
        const valFieldName = `:val_${key}${index}`;
        filtersForScan.ExpressionAttributeValues[valFieldName] = { [val.type]: value };
        valuesMappedConditions.push(`#key_${key} = ${valFieldName}`);
      });

      filtersForScan.FilterExpression += filtersForScan.FilterExpression ? ' AND (' : '(';
      filtersForScan.FilterExpression += valuesMappedConditions.join(' OR ');
      filtersForScan.FilterExpression += ')';
      isAnyFilterAdded = true;
    } else if (typeof val.data === 'string') {
      filtersForScan.ExpressionAttributeNames[`#key_${key}`] = key;
      filtersForScan.ExpressionAttributeValues[`:val_${key}`] = { [val.type]: val.data };
      filtersForScan.FilterExpression +=
        (filtersForScan.FilterExpression ? ' AND ' : '') + `#key_${key} = :val_${key}`;
      isAnyFilterAdded = true;
    } else if (isRangeObject(val.data)) {
      filtersForScan.ExpressionAttributeNames[`#key_${key}`] = key;
      filtersForScan.ExpressionAttributeValues[`:val_${key}_from`] = { [val.type]: val.data.from };
      filtersForScan.ExpressionAttributeValues[`:val_${key}_to`] = { [val.type]: val.data.to };
      filtersForScan.FilterExpression +=
        (filtersForScan.FilterExpression ? ' AND (' : '(') +
        `#key_${key} between :val_${key}_from and :val_${key}_to )`;
      isAnyFilterAdded = true;
    }
  }

  return isAnyFilterAdded && filtersForScan;
};

const isRangeObject = (val: Range | string[] | string): val is Range => {
  return typeof (val as Range).from === 'string' && typeof (val as Range).to === 'string';
};

@Service()
export default class DynamoDbService {
  constructor(
    @Inject('logger') private logger: Logger,
    @Inject('dynamoDb') private dynamoDb: DynamoDB,
  ) {}

  async getDynamoDbTableList(): Promise<ListTablesCommandOutput> {
    this.logger.info('Sending list table request to DynamoDB');
    return await this.dynamoDb.listTables({});
  }

  async getDynamoDbTableDescription(tableName: string): Promise<DescribeTableOutput> {
    const params = { TableName: tableName };
    this.logger.info(
      'Sending describe table request to DynamoDB with params' + JSON.stringify(params),
    );
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

    this.logger.info('Sending scan table request to DynamoDB with params' + JSON.stringify(params));
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

    this.logger.info(
      'Sending query table request to DynamoDB with params' + JSON.stringify(params),
    );
    return await this.dynamoDb.query(params);
  }

  async getDynamoDbTableScan(
    tableName: string,
    parsedQuery: ParsedQuery,
  ): Promise<QueryCommandOutput> {
    let params = {
      TableName: tableName,
    };
    if (parsedQuery) {
      params = { ...params, ...prepareFilterForScan(parsedQuery) };
    }

    this.logger.info('Sending scan table request to DynamoDB with params' + JSON.stringify(params));
    return await this.dynamoDb.scan(params);
  }

  async getDynamoDbItem(tableName: string, keysAndVales: KVP[]): Promise<GetItemCommandOutput> {
    const params = { Key: {}, TableName: tableName };
    keysAndVales.forEach((kvp: KVP) => {
      params.Key[kvp.key] = { S: kvp.val };
    });

    this.logger.info('Sending get item request to DynamoDB with params' + JSON.stringify(params));
    return await this.dynamoDb.getItem(params);
  }

  async putDynamoDbItem(tableName: string, item: ActivityItem): Promise<PutItemCommandOutput> {
    const params = {
      Item: prepareItemParams(item),
      ReturnConsumedCapacity: 'TOTAL',
      TableName: tableName,
    };

    this.logger.info('Sending put item request to DynamoDB with params' + JSON.stringify(params));
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

    this.logger.info(
      'Sending batch write item request to DynamoDB with params' + JSON.stringify(params),
    );
    return await this.dynamoDb.batchWriteItem(params);
  }
}
