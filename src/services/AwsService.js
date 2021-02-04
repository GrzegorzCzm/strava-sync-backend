const AWS = require("aws-sdk");

const { parsedActivityFields } = require("../../src/models/ActivityModel");

const prepareItemParams = (item) => {
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

const prepareFilterForScan = (filter) => ({
  ExpressionAttributeValues: {
    ":a": {
      [filter.type]: filter.val,
    },
  },
  FilterExpression: `${filter.key} = :a`,
});

class AwsService {
  constructor(logger) {
    this.logger = logger;
    this.dynamodb = new AWS.DynamoDB({
      apiVersion: "2012-08-10",
      region: "eu-central-1",
    });
  }

  getDynamoDbTableList(callback) {
    this.dynamodb.listTables({}, callback);
  }

  getDynamoDbTableDescription(tableName, callback) {
    const params = { TableName: tableName };

    this.dynamodb.describeTable(params, callback);
  }

  getActivitiesFromDateRange(tableName, from, to, callback) {
    const params = {
      ExpressionAttributeValues: {
        ":from": {
          N: from,
        },
        ":to": {
          N: to,
        },
      },
      FilterExpression: "#date between :from and :to",
      ExpressionAttributeNames: {
        "#date": "date",
      },
      TableName: tableName,
    };

    this.dynamodb.scan(params, callback);
  }

  getActivitiesFromGivenDay(tableName, date, callback) {
    const params = {
      ExpressionAttributeValues: {
        ":date": {
          N: date,
        },
      },
      KeyConditionExpression: "#date = :date",
      ExpressionAttributeNames: {
        "#date": "date",
      },
      TableName: tableName,
    };

    this.dynamodb.query(params, callback);
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

    this.dynamodb.scan(params, callback);
  }

  getDynamoDbItem(tableName, keysAndVales, callback) {
    const params = { Key: {}, TableName: tableName };
    keysAndVales.forEach((kvp) => {
      params.Key[kvp.key] = { S: kvp.val };
    });

    this.dynamodb.getItem(params, callback);
  }

  putDynamoDbItem(tableName, item, callback) {
    const params = {
      Item: prepareItemParams(item),
      ReturnConsumedCapacity: "TOTAL",
      TableName: tableName,
    };

    this.dynamodb.putItem(params, callback);
  }

  putDynamoDbBatchItems(tableName, items, callback) {
    const parsedItemsToAdd = items.map((item) => ({
      PutRequest: {
        Item: prepareItemParams(item),
      },
    }));

    const params = {
      RequestItems: {
        [tableName]: parsedItemsToAdd,
      },
    };
    this.dynamodb.batchWriteItem(params, callback);
  }
}
module.exports = AwsService;
