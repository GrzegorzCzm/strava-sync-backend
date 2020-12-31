var AWS = require("aws-sdk");

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
  constructor() {
    this.dynamodb = new AWS.DynamoDB({
      apiVersion: "2012-08-10",
      region: "eu-central-1",
    });
  }

  getDynamoDbTableList() {
    this.dynamodb.listTables({}, (err, data) => {
      if (err) console.log("Error: ", err, err.stack);
      else console.log("Data: ", data);
    });
  }

  getDynamoDbTableDescription(tableName) {
    const params = { TableName: tableName };

    this.dynamodb.describeTable(params, (err, data) => {
      if (err) console.log(err, err.stack);
      else console.log(data);
    });
  }

  /*
   * @param {Object} filter - { key: "keyName", val: "someValue", type: "S" },
   */
  getDynamoDbTableScan(tableName, filter) {
    let params = {
      TableName: tableName,
    };
    if (filter) {
      params = { ...params, ...prepareFilterForScan(filter) };
    }

    this.dynamodb.scan(params, (err, data) => {
      if (err) console.log(err, err.stack);
      else {
        data.Items.forEach((item) => console.log(JSON.stringify(item)));
      }
    });
  }

  getDynamoDbItem(tableName, keysAndVales) {
    const params = { Key: {}, TableName: tableName };
    keysAndVales.forEach((kvp) => {
      params.Key[kvp.key] = { S: kvp.val };
    });

    this.dynamodb.getItem(params, (err, data) => {
      if (err) console.log(err, err.stack);
      else {
        console.log(JSON.stringify(data));
      }
    });
  }

  putDynamoDbItem(tableName, item) {
    const params = {
      Item: prepareItemParams(item),
      ReturnConsumedCapacity: "TOTAL",
      TableName: tableName,
    };

    this.dynamodb.putItem(params, (err, data) => {
      if (err) console.log(err, err.stack);
      else console.log(data);
    });
  }

  putDynamoDbBatchItems(tableName, items) {
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
    this.dynamodb.batchWriteItem(params, function (err, data) {
      if (err) console.log(err, err.stack);
      else console.log(data);
    });
  }
}

module.exports = AwsService;
