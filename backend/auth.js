const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const poolData = {
    UserPoolId: process.env.COGNITO_USER_POOL_ID,
    ClientId: process.env.COGNITO_CLIENT_ID
};
const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

const signUp = async (username, password, email) => {
    const attributeList = [
        new AmazonCognitoIdentity.CognitoUserAttribute({ Name: 'email', Value: email })
    ];

    return new Promise((resolve, reject) => {
        userPool.signUp(username, password, attributeList, null, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.user);
            }
        });
    });
};

const signIn = async (username, password) => {
    const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
        Username: username,
        Password: password
    });

    const userData = {
        Username: username,
        Pool: userPool
    };

    const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

    return new Promise((resolve, reject) => {
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: (result) => {
                resolve(result);
            },
            onFailure: (err) => {
                reject(err);
            }
        });
    });
};

module.exports = { signUp, signIn };



