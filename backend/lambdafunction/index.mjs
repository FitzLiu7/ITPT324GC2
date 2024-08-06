import AWS from 'aws-sdk';
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = 'InsectProductionStock';

export const handler = async (event) => {
    try {
        const params = {
            TableName: TABLE_NAME
        };

        const data = await dynamoDB.scan(params).promise();
        const currentDate = new Date();

        const updatePromises = data.Items.map(item => {
            const itemDate = new Date(item.Date);
            const timeDifference = currentDate - itemDate;
            const daysDifference = timeDifference / (1000 * 3600 * 24); // Convert to days

            if (daysDifference >= 14) {
                let updateParams = {
                    TableName: TABLE_NAME,
                    Key: {
                        RoomNumber: item.RoomNumber
                    },
                    UpdateExpression: '',
                    ExpressionAttributeValues: {}
                };

                // Conditional updates based on current state
                if (item.FoodType === '1/2 Scoop') {
                    updateParams.UpdateExpression += 'set FoodType = :newFoodType, ';
                    updateParams.ExpressionAttributeValues[':newFoodType'] = '1 Scoop';
                } else if (item.FoodType === '1 Scoop') {
                    updateParams.UpdateExpression += 'set FoodType = :newFoodType, ';
                    updateParams.ExpressionAttributeValues[':newFoodType'] = '1 1/2 Scoops';
                } else if (item.FoodType === '1 1/2 Scoops') {
                    updateParams.UpdateExpression += 'set FoodType = :newFoodType, ';
                    updateParams.ExpressionAttributeValues[':newFoodType'] = '2 Scoops';
                } else if (item.FoodType === '2 Scoops') {
                    updateParams.UpdateExpression += 'set FoodType = :newFoodType, ';
                    updateParams.ExpressionAttributeValues[':newFoodType'] = '2 1/2 Scoops';
                }

                if (item.WaterType === 'Sponge') {
                    updateParams.UpdateExpression += 'WaterType = :newWaterType, ';
                    updateParams.ExpressionAttributeValues[':newWaterType'] = '2 rings';
                } else if (item.WaterType === '2 rings') {
                    updateParams.UpdateExpression += 'WaterType = :newWaterType, ';
                    updateParams.ExpressionAttributeValues[':newWaterType'] = '1 ring';
                }

                // Remove trailing comma and space
                if (updateParams.UpdateExpression.endsWith(', ')) {
                    updateParams.UpdateExpression = updateParams.UpdateExpression.slice(0, -2);
                }

                if (updateParams.UpdateExpression) {
                    return dynamoDB.update(updateParams).promise();
                }
            }
        }).filter(Boolean); // Remove undefined promises

        // Await all the update operations to finish
        await Promise.all(updatePromises);

        return {
            statusCode: 200,
            body: JSON.stringify('Update completed successfully')
        };
    } catch (error) {
        console.error('Error updating data:', error);
        return {
            statusCode: 500,
            body: JSON.stringify(`Error updating data: ${error.message}`)
        };
    }
};
