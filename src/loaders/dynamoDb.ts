import { DynamoDB } from '@aws-sdk/client-dynamodb';

export default (): DynamoDB =>
  new DynamoDB({
    apiVersion: '2012-08-10',
    region: 'eu-central-1',
  });
