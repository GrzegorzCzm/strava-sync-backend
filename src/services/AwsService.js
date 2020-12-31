var AWS = require("aws-sdk");

const prepareParams = (kvpList) => {
  const params = {};
  kvpList.forEach(
    (kvp) =>
      (params[kvp.key] = {
        [kvp.type]: kvp.val,
      })
  );
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

  /*
   * @param {Object} item - { key: "keyName", val: "someValue", type: "S" },
   */
  putDynamoDbItem(tableName, item) {
    const params = {
      Item: prepareParams(item),
      ReturnConsumedCapacity: "TOTAL",
      TableName: tableName,
    };

    this.dynamodb.putItem(params, (err, data) => {
      if (err) console.log(err, err.stack);
      else console.log(data);
    });
  }
}

module.exports = AwsService;
