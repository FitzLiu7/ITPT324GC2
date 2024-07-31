require('dotenv').config();
const { confirmUser } = require('../auth');

const username = 'testuser'; // Replace with your test username
const confirmationCode = '335884'; // Replace with the actual confirmation code received

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
