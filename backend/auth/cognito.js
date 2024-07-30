const AWS = require('aws-sdk');
const CognitoIdentityServiceProvider = AWS.CognitoIdentityServiceProvider;
const cognito = new CognitoIdentityServiceProvider();
const bcrypt = require('bcrypt');
const saltRounds = 10;

const signUpUser = async (username, password) => {
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const params = {
        ClientId: process.env.COGNITO_CLIENT_ID,
        Username: username,
        Password: hashedPassword,
        UserAttributes: [
            { Name: 'email', Value: username }
        ]
    };

    try {
        const data = await cognito.signUp(params).promise();
        return data;
    } catch (error) {
        console.error('Error signing up user:', error);
        throw new Error(error);
    }
};

module.exports = {
    signUpUser,
};