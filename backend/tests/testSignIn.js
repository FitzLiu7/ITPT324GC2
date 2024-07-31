require('dotenv').config();
const { signIn } = require('../auth');

const username = 'testuser'; // Replace with your test username
const password = 'TestPassword123!'; // Replace with your test password

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
