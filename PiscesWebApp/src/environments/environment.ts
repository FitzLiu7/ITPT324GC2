export const environment = {
  production: false,
  aws: {
    region: 'ap-southeast-2',
    userPoolId: 'ap-southeast-2_S9Quvnwt5',
    userPoolWebClientId: 'fsklgrvsppomao3savu9397n5',
    identityPoolId: 'ap-southeast-2:fae3a911-bba9-41b3-96e9-ee2b6b4ee542', // Optional, needed if using Cognito Identity Pool
    s3Bucket: 'insect-production-data',
    apiGateway: {
      name: ' InsectProductionAPI',
      endpoint:
        ' https://klcnzhe9v3.execute-api.ap-southeast-2.amazonaws.com/prod',
    },
  },
};
