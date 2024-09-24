const express = require("express");
const path = require("path");
const AWS = require("aws-sdk");
const bodyParser = require("body-parser");
const http = require("http");
const WebSocket = require("ws");
const app = express();
const cors = require("cors");
const { signUp, confirmSignUp, signIn, getUserList } = require("./auth");
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

// Handle WebSocket connections
wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("close", () => {
    console.log("Client disconnected");
  });

  ws.on("message", (message) => {
    console.log("Received:", message);
  });
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));
app.use(bodyParser.json());

// Serve signup.html
app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "signup.html"));
});

// Serve dashboard.html
app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "dashboard.html"));
});

// add Employee Staff TaskList

app.post("/addStaffTask", async (req, res) => {
  let { userName, roomNumber , startTime, task} = req.body

  if (!userName || !roomNumber || !startTime || !task) {
    return res.status(400).send("Missing required fields");
  }

  roomNumber = getPartitionKey(roomNumber)

  const params = {
    TableName: "InsectProductionStaffTimes",
    Item: {
      userName, roomNumber , startTime, task, working: false
    }
  }

  try {
    await dynamoDB.put(params).promise();
    res.status(201).json({ message: "Data added successfully" });

    // Send WebSocket update
    broadcastUpdate({ message: "Data added", data: params.Item });
  } catch (error) {
    console.error("Error adding data:", error);
    res.status(500).send(`Error adding data: ${error.message}`);
  }
})

app.put("/updateStaffTask", async (req, res) => {
  let { userName, roomNumber , startTime, task, working} = req.body
  if  (working === undefined || working === null) {
    working = false
  }
  if (!userName || !roomNumber || !startTime || !task) {
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
        "set #rn = :roomNumber, #s = :startTime, #t = :task, #wk = :working",
    ExpressionAttributeNames: {
      "#rn": "roomNumber",
      "#s": "startTime",
      "#t": "task",
      "#wk": "working"
    },
    ExpressionAttributeValues: {
      ":roomNumber": roomNumber,
      ":startTime": startTime,
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

// Get StaffTask List
app.get("/getStaffTaskList", async (req, res) => {
  const params = {
    TableName: "InsectProductionStaffTimes",
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

  // Validate and map RoomNumber
  const partitionKey = getPartitionKey(RoomNumber);
  if (isNaN(partitionKey)) {
    return res.status(400).send("Invalid RoomNumber");
  }

  const params = {
    TableName: "InsectProductionStock",
    Key: {
      RoomNumber: partitionKey,
    },
    UpdateExpression:
      "set #d = :date, #f = :foodType, #w = :waterType, #t = :tubs, #we = :week, #s = :stock, #st = :stockType",
    ExpressionAttributeNames: {
      "#d": "Date",
      "#f": "FoodType",
      "#w": "WaterType",
      "#t": "Tubs",
      "#we": "Week",
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

// Delete Data
app.delete("/delete-data/:roomNumber", async (req, res) => {
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
    await dynamoDB.delete(params).promise();
    res.status(200).json({ message: "Data deleted successfully" });

    // Send WebSocket update
    broadcastUpdate({ message: "Data deleted", roomNumber: partitionKey });
  } catch (error) {
    console.error("Error deleting data:", error);
    res.status(500).send(`Error deleting data: ${error.message}`);
  }
});



app.post("/sign-up", async (req, res) => {
  const { username, password, email } = req.body;
  try {
    const user = await signUp(username, password, email);
    res.status(200).json({
      message:
        "Sign-Up successful. Please check your email for the confirmation code.",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Error signing up", error: error.message });
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


app.post("/confirm-sign-up", async (req, res) => {
  const { username, confirmationCode } = req.body;
  try {
    const result = await confirmSignUp(username, confirmationCode);
    res.status(200).json({
      message: "Confirmation successful. You can now sign in.",
      result,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error confirming sign-up", error: error.message });
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
