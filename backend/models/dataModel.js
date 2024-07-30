const AWS = require('aws-sdk');

// Configure AWS SDK with the region
AWS.config.update({
    region: 'ap-southeast-2'
});

// Initialize DynamoDB DocumentClient
const dynamodb = new AWS.DynamoDB.DocumentClient();

async function getData(primaryKey) {
    try {
        const params = {
            TableName: 'InsectProductionStock',
            Key: {
                'PrimaryKey': primaryKey 
            }
        };
        const data = await dynamodb.get(params).promise();
        return data.Item;
    } catch (error) {
        console.error('Error getting data:', error);
        throw new Error(error);
    }
}

module.exports = { getData };