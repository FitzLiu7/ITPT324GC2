const { CognitoIdentityProviderClient, SignUpCommand, AdminConfirmSignUpCommand, AdminInitiateAuthCommand } = require('@aws-sdk/client-cognito-identity-provider');
const { createHmac } = require('crypto');

const CLIENT_SECRET = process.env.COGNITO_CLIENT_SECRET;
const CLIENT_ID = process.env.COGNITO_CLIENT_ID;
const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;

const cognito = new CognitoIdentityProviderClient({ region: 'ap-southeast-2' }); // Replace with your region

function generateSecretHash(username) {
    const hasher = createHmac('sha256', CLIENT_SECRET);
    hasher.update(`${username}${CLIENT_ID}`);
    return hasher.digest('base64');
}

async function signUp(username, password, attributes) {
    const secretHash = generateSecretHash(username);

    const command = new SignUpCommand({
        ClientId: CLIENT_ID,
        Username: username,
        Password: password,
        SecretHash: secretHash,
        UserAttributes: [
            { Name: 'email', Value: attributes.email },
            { Name: 'given_name', Value: attributes.firstName },
            { Name: 'family_name', Value: attributes.lastName },
        ]
    });

    return cognito.send(command);
}

async function confirmUser(username) {
    const command = new AdminConfirmSignUpCommand({
        UserPoolId: USER_POOL_ID,
        Username: username,
    });

    return cognito.send(command);
}

async function signIn(username, password) {
    const command = new AdminInitiateAuthCommand({
        AuthFlow: 'ADMIN_NO_SRP_AUTH',
        UserPoolId: USER_POOL_ID,
        ClientId: CLIENT_ID,
        AuthParameters: {
            USERNAME: username,
            PASSWORD: password,
            SECRET_HASH: generateSecretHash(username),
        },
    });

    return cognito.send(command);
}

module.exports = { signUp, confirmUser, signIn };
