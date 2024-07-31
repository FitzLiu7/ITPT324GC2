const awsmobile = {
  Auth: {
    identityPoolId: 'ap-southeast-2:fae3a911-bba9-41b3-96e9-ee2b6b4ee542',
    region: 'ap-southeast-2',
    userPoolId: 'ap-southeast-2_S9Quvnwt5',
    userPoolWebClientId: 'fsklgrvsppomao3savu9397n5',
  },
  Storage: {
    bucket: 'insect-production-data',
    region: 'ap-southeast-2',
  },
  API: {
    endpoints: [
      {
        name: 'InsectProductionAPI',
        endpoint:
          'https://klcnzhe9v3.execute-api.ap-southeast-2.amazonaws.com/prod',
        region: 'ap-southeast-2',
      },
    ],
  },
};

export default awsmobile;
