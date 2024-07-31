require('dotenv').config();
const { confirmUser } = require('./auth');

const username = 'testuser';
const confirmationCode = '123456'; //enter verification code from your email here

async function testConfirmUser() {
    try {
        console.log('Testing User Confirmation...');
        const result = await confirmUser(username, confirmationCode);
        console.log('User confirmed:', result);
    } catch (error) {
        console.error('User Confirmation error:', error.message || error);
    }
}

testConfirmUser();
