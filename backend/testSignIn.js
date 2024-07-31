require('dotenv').config();
const { signIn } = require('./auth');

const username = 'testuser';
const password = 'TestPassword123!';

async function testSignIn() {
    try {
        console.log('Testing Sign-In...');
        const result = await signIn(username, password);
        console.log('Sign-In successful:', result);
    } catch (error) {
        console.error('Sign-In error:', error.message || error);
    }
}

testSignIn();
