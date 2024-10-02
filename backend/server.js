const express = require("express");
const path = require("path");
const AWS = require("aws-sdk");
const bodyParser = require("body-parser");
const http = require("http");
const WebSocket = require("ws");
const app = express();
const cors = require("cors");
const { signUp, confirmSignUp, signIn, getUserList, deleteUser } = require("./auth");
require("dotenv").config();

// CORS configuration
const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:4200"; // Set frontend URL dynamically
app.use(cors({
    origin: allowedOrigin,
    optionsSuccessStatus: 200,
}));

// AWS DynamoDB configuration
const dynamoDB = new AWS.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION || "ap-southeast-2",
});

// Mapping of room labels to numeric keys
const roomMapping = {
    'N1': 1001,
    'N2': 1002,
};

// Function to get the partition key from the room label
function getPartitionKey(roomLabel) {
    if (roomMapping[roomLabel]) {
        return roomMapping[roomLabel];
    }
    return parseInt(roomLabel); // For numeric room labels like '1', '2', etc.
}

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket server
const wss = new WebSocket.Server({ server });

// Function to broadcast updates to all WebSocket clients
function broadcastUpdate(message) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
}

// Function to handle ping-pong mechanism
function setupPingPong(ws) {
    ws.isAlive = true;

    ws.on("pong", () => {
        ws.isAlive = true;
    });
}

// Periodically check and terminate inactive connections
const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
        if (ws.isAlive === false) {
            return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping(); // Send a ping message to check the connection
    });
}, 30000); // 30 seconds interval

// Handle WebSocket connections
wss.on("connection", (ws) => {
    console.log("Client connected");
    
    // Set up ping-pong mechanism for the client
    setupPingPong(ws);

    ws.on("close", () => {
        console.log("Client disconnected");
    });

    ws.on("message", (message) => {
        console.log("Received:", message);
    });

    ws.on("error", (error) => {
        console.error("WebSocket error:", error);
    });
});

// Clear the interval when the server shuts down
wss.on("close", () => {
    clearInterval(interval);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));
app.use(bodyParser.json());


// Add Employee Staff TaskList
app.post("/addStaffTask", async (req, res) => {
    let { userName, roomNumber, startTime, endTime, task } = req.body;

    if (!userName || !roomNumber || !startTime || !task) {
        return res.status(400).send("Missing required fields");
    }

    roomNumber = getPartitionKey(roomNumber);

    const params = {
        TableName: "InsectProductionStaffTimes",
        Item: {
            userName, 
            roomNumber, 
            startTime, 
            endTime: endTime || null,
            task, 
            working: false
        }
    };

    try {
        await dynamoDB.put(params).promise();
        res.status(201).json({ message: "Data added successfully" });

        // Send WebSocket update
        broadcastUpdate({ message: "Data added", data: params.Item });
    } catch (error) {
        console.error("Error adding data:", error);
        res.status(500).send(`Error adding data: ${error.message}`);
    }
});

// Update Staff Task
app.put("/updateStaffTask", async (req, res) => {
    let { userName, roomNumber, startTime, endTime, task, working } = req.body;
    if (working === undefined || working === null) {
        working = false;
    }
    if (!userName || !roomNumber || !startTime || !task || !endTime) {
        return res.status(400).send("Missing required fields");
    }

    // Validate and map RoomNumber
    roomNumber = getPartitionKey(roomNumber);
    if (isNaN(roomNumber)) {
        return res.status(400).send("Invalid RoomNumber");
    }

    const params = {
        TableName: "InsectProductionStaffTimes",
        Key: {
            userName: userName,
        },
        UpdateExpression:
            "set #rn = :roomNumber, #s = :startTime, #et = :endTime, #t = :task, #wk = :working",
        ExpressionAttributeNames: {
            "#rn": "roomNumber",
            "#s": "startTime",
            "#et": "endTime",
            "#t": "task",
            "#wk": "working"
        },
        ExpressionAttributeValues: {
            ":roomNumber": roomNumber,
            ":startTime": startTime,
            ":endTime": endTime,
            ":task": task,
            ":working": working,
        },
        ReturnValues: "UPDATED_NEW",
    };

    try {
        const result = await dynamoDB.update(params).promise();
        res.status(200).json(result.Attributes);

        // Send WebSocket update
        broadcastUpdate({ message: "Data updated", data: result.Attributes });
    } catch (error) {
        console.error("Error updating data:", error);
        res.status(500).send(`Error updating data: ${error.message}`);
    }
});

// Get Staff Task List
app.get("/getStaffTaskList", async (req, res) => {
    const params = {
        TableName: "InsectProductionStaffTimes",
    };

    try {
        const data = await dynamoDB.scan(params).promise();
        // Include endTime in the response data if it exists
        const tasks = data.Items.map(item => ({
            ...item,
            endTime: item.endTime || null,
        }));
        res.json(tasks);
    } catch (err) {
        console.error(
            "Unable to scan the table. Error JSON:",
            JSON.stringify(err, null, 2)
        );
        res.status(500).json({ error: "Could not retrieve data" });
    }
});


// Add Data
app.post("/add-data", async (req, res) => {
    const {
        RoomNumber,
        Date,
        FoodType,
        WaterType,
        Tubs,
        Week,
        Stock,
        StockType,
    } = req.body;

    if (
        !RoomNumber ||
        !Date ||
        !FoodType ||
        !WaterType ||
        Tubs === undefined ||
        Week === undefined ||
        Stock === undefined ||
        !StockType
    ) {
        return res.status(400).send("Missing required fields");
    }

    // Validate and map RoomNumber
    const partitionKey = getPartitionKey(RoomNumber);
    if (isNaN(partitionKey)) {
        return res.status(400).send("Invalid RoomNumber");
    }

    const params = {
        TableName: process.env.DYNAMODB_TABLE || "InsectProductionStock",
        Item: {
            RoomNumber: partitionKey,
            Date,
            FoodType,
            WaterType,
            Tubs,
            Stock,
            Week,
            StockType,
        },
    };

    try {
        await dynamoDB.put(params).promise();
        res.status(201).json({ message: "Data added successfully" });

        // Send WebSocket update
        broadcastUpdate({ message: "Data added", data: params.Item });
    } catch (error) {
        console.error("Error adding data:", error);
        res.status(500).send(`Error adding data: ${error.message}`);
    }
});

// Get List
app.get("/get-list", async (req, res) => {
    const params = {
        TableName: "InsectProductionStock",
    };

    try {
        const data = await dynamoDB.scan(params).promise();
        res.json(data.Items);
    } catch (err) {
        console.error(
            "Unable to scan the table. Error JSON:",
            JSON.stringify(err, null, 2)
        );
        res.status(500).json({ error: "Could not retrieve data" });
    }
});

// Retrieve Data
app.get("/get-data/:roomNumber", async (req, res) => {
    const roomNumber = req.params.roomNumber;
    const partitionKey = getPartitionKey(roomNumber);

    if (isNaN(partitionKey)) {
        return res.status(400).send("Invalid RoomNumber");
    }

    const params = {
        TableName: "InsectProductionStock",
        Key: {
            RoomNumber: partitionKey,
        },
    };

    try {
        const data = await dynamoDB.get(params).promise();
        if (data.Item) {
            res.status(200).json(data.Item);
        } else {
            res.status(404).json({
                message: "Data not found",
            });
        }
    } catch (error) {
        console.error("Error retrieving data:", error);
        res.status(500).send(`Error retrieving data: ${error.message}`);
    }
});

// Update Data
app.put("/update-data", async (req, res) => {
    const {
        RoomNumber,
        Date,
        FoodType,
        WaterType,
        Tubs,
        Week,
        Stock,
        StockType,
    } = req.body;

    if (
        !RoomNumber ||
        !Date ||
        !FoodType ||
        !WaterType ||
        Tubs === undefined ||
        Week === undefined ||
        Stock === undefined ||
        !StockType
    ) {
        return res.status(400).send("Missing required fields");
    }

    const partitionKey = getPartitionKey(RoomNumber);
    if (isNaN(partitionKey)) {
        return res.status(400).send("Invalid RoomNumber");
    }

    const params = {
        TableName: process.env.DYNAMODB_TABLE || "InsectProductionStock",
        Key: {
            RoomNumber: partitionKey,
        },
        UpdateExpression:
            "set #d = :date, #ft = :foodType, #wt = :waterType, #t = :tubs, #w = :week, #s = :stock, #st = :stockType",
        ExpressionAttributeNames: {
            "#d": "Date",
            "#ft": "FoodType",
            "#wt": "WaterType",
            "#t": "Tubs",
            "#w": "Week",
            "#s": "Stock",
            "#st": "StockType",
        },
        ExpressionAttributeValues: {
            ":date": Date,
            ":foodType": FoodType,
            ":waterType": WaterType,
            ":tubs": Tubs,
            ":week": Week,
            ":stock": Stock,
            ":stockType": StockType,
        },
        ReturnValues: "UPDATED_NEW",
    };

    try {
        const result = await dynamoDB.update(params).promise();
        res.status(200).json(result.Attributes);

        // Send WebSocket update
        broadcastUpdate({ message: "Data updated", data: result.Attributes });
    } catch (error) {
        console.error("Error updating data:", error);
        res.status(500).send(`Error updating data: ${error.message}`);
    }
});

// Release a specified amount of Tubs from the Stock Table
app.put("/release-tubs", async (req, res) => {
    const { RoomNumber, amount } = req.body; // Destructure the room number and amount from the request body

    // Validate the input
    if (!RoomNumber || !amount || amount <= 0 || typeof amount !== 'number') {
        return res.status(400).json({ error: "Missing required fields or invalid amount" });
    }

    const partitionKey = getPartitionKey(RoomNumber); // Get the partition key from the RoomNumber
    if (isNaN(partitionKey)) {
        return res.status(400).json({ error: "Invalid RoomNumber" });
    }

    // Step 1: Decrease the Tubs value
    const params = {
        TableName: process.env.DYNAMODB_TABLE || "InsectProductionStock",
        Key: {
            RoomNumber: partitionKey, // Specify the partition key
        },
        // UpdateExpression to subtract the amount from Tubs stock
        UpdateExpression: "SET #tubsStock = #tubsStock - :amount", 
        ExpressionAttributeNames: {
            "#tubsStock": "Tubs", // Reference to Tubs attribute
        },
        ExpressionAttributeValues: {
            ":amount": amount, // The amount to subtract
        },
        ReturnValues: "UPDATED_NEW", // Return the updated value
        ConditionExpression: "#tubsStock >= :amount", // Ensure there's enough stock to release
    };

    try {
        const result = await dynamoDB.update(params).promise(); // Update the stock in DynamoDB

        // Check if the Tubs value has reached 0
        if (result.Attributes.Tubs === 0) {
            // Step 2: Set other fields to null when Tubs reach 0
            const clearParams = {
                TableName: process.env.DYNAMODB_TABLE || "InsectProductionStock",
                Key: {
                    RoomNumber: partitionKey,
                },
                UpdateExpression: "SET #d = :nullVal, #ft = :nullVal, #wt = :nullVal, #w = :nullVal, #s = :nullVal, #st = :nullVal", 
                ExpressionAttributeNames: {
                    "#d": "Date",
                    "#ft": "FoodType",
                    "#wt": "WaterType",
                    "#w": "Week",
                    "#s": "Stock",
                    "#st": "StockType",
                },
                ExpressionAttributeValues: {
                    ":nullVal": null, // Set the values to null
                },
                ReturnValues: "UPDATED_NEW",
            };

            // Set the fields to null in the table
            await dynamoDB.update(clearParams).promise();

            // Optionally, broadcast update via WebSocket if needed
            broadcastUpdate({ message: "Tubs reached 0; other data cleared", data: { RoomNumber: partitionKey } });
        }

        res.status(200).json({ message: "Tubs released successfully", updatedTubsStock: result.Attributes.Tubs });
    } catch (error) {
        console.error("Error releasing tubs:", error);
        // Enhance error handling
        if (error.code === "ConditionalCheckFailedException") {
            return res.status(400).json({ error: "Insufficient tubs available" });
        }
        res.status(500).json({ error: `Error releasing tubs: ${error.message}` });
    }
});



app.get('/getUserList', async (req, res) => {
    try {
        const result = await getUserList();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(`Error getting user list: ${error.message}`);
    }
})

app.post("/signup", async (req, res) => {
    const { username, password, email } = req.body;

    if (!username || !password || !email) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        const user = await signUp(username, password, email);
        res.status(200).json({
            message: "Sign-Up successful. Please check your email for the confirmation code.",
            user,
        });
    } catch (error) {
        console.error("Sign-Up error:", error);
        res.status(500).json({ message: error.message }); // Use the error message from the signUp function
    }
});

// Confirm sign-up route
app.post('/confirm-signup', async (req, res) => {
    try {
      const { username, code } = req.body;
      const result = await confirmSignUp(username, code);
      res.status(200).json({ message: 'User confirmed successfully', result });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Confirmation failed', error: error.message });
    }
  });

app.delete('/delete-user', async (req, res) => {
const { username } = req.body;

if (!username) {
    return res.status(400).json({ message: "Username is required." });
}
try {
    await deleteUser(username);
    res.status(200).json({ message: "User deleted successfully." });
} catch (error) {
    console.error("Delete User error:", error);
    res.status(500).json({ message: "Error deleting user", error: error.message });    
    }
});

app.post("/sign-in", async (req, res) => {
    const { username, password } = req.body;
    try {
        const authResult = await signIn(username, password);
        res.status(200).json({ message: "Sign-In successful", authResult });
    } catch (error) {
        res.status(500).json({ message: "Error signing in", error: error.message });
    }
});

// Root route to display a message
app.get("/", (req, res) => {
    res.send("Backend is working!");
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
