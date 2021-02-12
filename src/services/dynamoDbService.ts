import { Service, Inject } from 'typedi';

import { parsedActivityFields } from '../models/ActivityModel';

const prepareItemParams = item => {
  const params = {};

  for (const [key, value] of Object.entries(item)) {
    if (
      key === parsedActivityFields.DISTANCE ||
      key === parsedActivityFields.MOVING_TIME ||
      key === parsedActivityFields.DATE
    ) {
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

const prepareFilterForScan = filter => ({
  ExpressionAttributeValues: {
    ':a': {
      [filter.type]: filter.val,
    },
  },
  FilterExpression: `${filter.key} = :a`,
});

@Service()
export default class DynamoDbService {
  constructor(@Inject('logger') private logger, @Inject('dynamoDb') private dynamoDb) {}

  getDynamoDbTableList(callback) {
    this.dynamoDb.listTables({}, callback);
  }

  getDynamoDbTableDescription(tableName, callback) {
    const params = { TableName: tableName };

    this.dynamoDb.describeTable(params, callback);
  }

  getActivitiesFromDateRange(tableName, from, to, callback) {
    const params = {
      ExpressionAttributeValues: {
        ':from': {
          N: from,
        },
        ':to': {
          N: to,
        },
      },
      FilterExpression: '#date between :from and :to',
      ExpressionAttributeNames: {
        '#date': 'date',
      },
      TableName: tableName,
    };

    this.dynamoDb.scan(params, callback);
  }

  getActivitiesFromGivenDay(tableName, date, callback) {
    const params = {
      ExpressionAttributeValues: {
        ':date': {
          N: date,
        },
      },
      KeyConditionExpression: '#date = :date',
      ExpressionAttributeNames: {
        '#date': 'date',
      },
      TableName: tableName,
    };

    this.dynamoDb.query(params, callback);
  }

  /*
   * @param {Object} filter - { key: "keyName", val: "someValue", type: "S" },
   */
  getDynamoDbTableScan(tableName, filter, callback) {
    let params = {
      TableName: tableName,
    };
    if (filter) {
      params = { ...params, ...prepareFilterForScan(filter) };
    }

    this.dynamoDb.scan(params, callback);
  }

  getDynamoDbItem(tableName, keysAndVales, callback) {
    const params = { Key: {}, TableName: tableName };
    keysAndVales.forEach(kvp => {
      params.Key[kvp.key] = { S: kvp.val };
    });

    this.dynamoDb.getItem(params, callback);
  }

  putDynamoDbItem(tableName, item, callback) {
    const params = {
      Item: prepareItemParams(item),
      ReturnConsumedCapacity: 'TOTAL',
      TableName: tableName,
    };

    this.dynamoDb.putItem(params, callback);
  }

  putDynamoDbBatchItems(tableName, items, callback) {
    const parsedItemsToAdd = items.map(item => ({
      PutRequest: {
        Item: prepareItemParams(item),
      },
    }));

    const params = {
      RequestItems: {
        [tableName]: parsedItemsToAdd,
      },
    };
    this.dynamoDb.batchWriteItem(params, callback);
  }
}
