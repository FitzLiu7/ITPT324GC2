const express = require('express');
const AWS = require('aws-sdk');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const dynamoDB = new AWS.DynamoDB.DocumentClient({ region: process.env.AWS_REGION });

app.use(bodyParser.json());

// Add Data
app.post('/add-data', async (req, res) => {
    const { RoomNumber, Tubs, Date, FoodType, WaterType } = req.body;

    // Ensure all required fields are provided
    if (RoomNumber === undefined || Tubs === undefined || Date === undefined || FoodType === undefined || WaterType === undefined) {
        return res.status(400).send('Missing required fields');
    }

    // Ensure RoomNumber and Tubs are numbers
    if (typeof RoomNumber !== 'number' || typeof Tubs !== 'number') {
        return res.status(400).send('RoomNumber and Tubs must be numbers');
    }

    const params = {
        TableName: 'InsectProductionStock',
        Item: {
            RoomNumber, // Use RoomNumber as the partition key
            Tubs,
            Date,
            FoodType,
            WaterType
        }
    };

    try {
        await dynamoDB.put(params).promise();
        res.status(201).send('Data added successfully');
    } catch (error) {
        console.error('Error adding data:', error);
        res.status(500).send(`Error adding data: ${error.message}`);
    }
});

// Retrieve Data
app.get('/get-data/:roomNumber', async (req, res) => {
    const roomNumber = parseInt(req.params.roomNumber, 10);

    if (isNaN(roomNumber)) {
        return res.status(400).send('Invalid RoomNumber');
    }

    const params = {
        TableName: 'InsectProductionStock',
        Key: {
            RoomNumber: roomNumber
        }
    };

    try {
        const data = await dynamoDB.get(params).promise();
        if (data.Item) {
            res.status(200).json(data.Item);
        } else {
            res.status(404).send('Data not found');
        }
    } catch (error) {
        console.error('Error retrieving data:', error);
        res.status(500).send(`Error retrieving data: ${error.message}`);
    }
});

// Update Data
app.put('/update-data', async (req, res) => {
    const { RoomNumber, Tubs, Date, FoodType, WaterType } = req.body;

    if (RoomNumber === undefined || Tubs === undefined || Date === undefined || FoodType === undefined || WaterType === undefined) {
        return res.status(400).send('Missing required fields');
    }

    if (typeof RoomNumber !== 'number' || typeof Tubs !== 'number') {
        return res.status(400).send('RoomNumber and Tubs must be numbers');
    }

    const params = {
        TableName: 'InsectProductionStock',
        Key: {
            RoomNumber
        },
        UpdateExpression: 'set Tubs = :tubs, #d = :date, #f = :foodType, #w = :waterType',
        ExpressionAttributeNames: {
            '#d': 'Date',
            '#f': 'FoodType',
            '#w': 'WaterType'
        },
        ExpressionAttributeValues: {
            ':tubs': Tubs,
            ':date': Date,
            ':foodType': FoodType,
            ':waterType': WaterType
        },
        ReturnValues: 'UPDATED_NEW'
    };

    try {
        const result = await dynamoDB.update(params).promise();
        res.status(200).json(result.Attributes);
    } catch (error) {
        console.error('Error updating data:', error);
        res.status(500).send(`Error updating data: ${error.message}`);
    }
});

// Delete Data
app.delete('/delete-data/:roomNumber', async (req, res) => {
    const roomNumber = parseInt(req.params.roomNumber, 10);

    if (isNaN(roomNumber)) {
        return res.status(400).send('Invalid RoomNumber');
    }

    const params = {
        TableName: 'InsectProductionStock',
        Key: {
            RoomNumber: roomNumber
        }
    };

    try {
        await dynamoDB.delete(params).promise();
        res.status(200).send('Data deleted successfully');
    } catch (error) {
        console.error('Error deleting data:', error);
        res.status(500).send(`Error deleting data: ${error.message}`);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
