require('dotenv').config();
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const AWS = require('aws-sdk');

const poolData = {
    UserPoolId: process.env.COGNITO_USER_POOL_ID,
    ClientId: process.env.COGNITO_CLIENT_ID,
};

// Initialize user pool
const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
AWS.config.update({ region: 'ap-southeast-2' });
const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();

// Function to determine role based on username prefix
const getRoleFromUsername = (username) => {
    if (username.startsWith('mg')) {
        return 'Manager';
    } else if (username.startsWith('st')) {
        return 'Staff';
    } else {
        return 'N/A';  // You can handle unknown roles if necessary
    }
};

//get user list
const getUserList = async () => {
    const params = {
        UserPoolId: process.env.COGNITO_USER_POOL_ID,
    }
    return new Promise((resolve, reject) => {
        cognitoIdentityServiceProvider.listUsers(params, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

// Sign-Up function
const signUp = async (username, password, email) => {
    const attributeList = [
        new AmazonCognitoIdentity.CognitoUserAttribute({ Name: 'email', Value: email })
    ];

    return new Promise((resolve, reject) => {
        userPool.signUp(username, password, attributeList, null, (err, result) => {
            if (err) {
                // Check specific error codes to provide better feedback
                if (err.code === 'UsernameExistsException') {
                    reject(new Error("Username already exists. Please choose a different username."));
                } else if (err.code === 'InvalidParameterException') {
                    reject(new Error("Invalid parameters. Please check your inputs."));
                } else {
                    // For any other errors, provide a generic message
                    reject(new Error("An error occurred during sign up. Please try again."));
                }
            } else {
                resolve(result.user);
            }
        });
    });
};


// Confirm Sign-Up function
const confirmSignUp = async (username, code) => {
    const userData = {
        Username: username,
        Pool: userPool
    };

    const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

    return new Promise((resolve, reject) => {
        cognitoUser.confirmRegistration(code, true, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

// Delete User function
const deleteUser = async (username) => {
    const params = {
        UserPoolId: process.env.COGNITO_USER_POOL_ID,
        Username: username,
    };

    return new Promise((resolve, reject) => {
        cognitoIdentityServiceProvider.adminDeleteUser(params, (err) => {
            if (err) {
                console.error("Delete User error:", err);
                return reject("Error deleting user. " + err.message);
            }
            resolve("User deleted successfully.");
        });
    });
};

// Sign-In function with role assignment
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
                // Extract role based on username prefix
                const role = getRoleFromUsername(username);

                // Log the user's role to the console
                console.log(`User ${username} logged in with role: ${role}`);
                
                // Add the role to the authentication result
                resolve({
                    result,  // Cognito authentication result
                    role     // Role derived from username prefix
                });
            },
            onFailure: (err) => {
                reject(err);
            }
        });
    });
};

module.exports = { signUp, confirmSignUp, signIn, getUserList };