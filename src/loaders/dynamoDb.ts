import AWS from 'aws-sdk';

export default () =>
  new AWS.DynamoDB({
    apiVersion: '2012-08-10',
    region: 'eu-central-1',
  });
