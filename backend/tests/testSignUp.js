require('dotenv').config();
const { signUp } = require('../auth');

const username = 'testuser'; // Replace with your test username
const password = 'TestPassword123!'; // Replace with your test password
const attributes = {
    email: 'brodiebowenmorgan76@gmail.com',
    firstName: 'Test',
    lastName: 'User'
};

async function testSignUp() {
    try {
        console.log('Testing Sign-Up...');
        const result = await signUp(username, password, attributes);
        console.log('Sign-Up successful:', result);

        // You can print or log the confirmation code if you need it
        console.log('Please check your email for the confirmation code.');
    } catch (error) {
        console.error('Sign-Up error:', error.message || error);
    }
}

testSignUp();
